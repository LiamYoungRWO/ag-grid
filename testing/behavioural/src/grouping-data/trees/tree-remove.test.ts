import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { RowDataTransaction } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { TestGridsManager, executeTransactionsAsync, flushJestTimers, getAllRows } from '../../test-utils';
import type { TreeDiagramOptions } from './tree-test-utils';
import { TreeDiagram } from './tree-test-utils';

const treeDiagramOptions: TreeDiagramOptions = {
    checkDom: 'myGrid',
};

describe('ag-grid tree transactions', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowGroupingModule] });

    beforeEach(() => {
        jest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        jest.useRealTimers();
        gridsManager.reset();
    });

    test('tree transaction remove', async () => {
        const rowA = { id: 'a', orgHierarchy: ['A'] };
        const rowC = { id: 'c', orgHierarchy: ['A', 'B', 'C'] };
        const rowD = { id: 'd', orgHierarchy: ['A', 'B', 'C', 'D'] };

        jest.useFakeTimers({ advanceTimers: true });

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowC, rowD],
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        new TreeDiagram(api, '', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:a
            · └─┬ B filler id:row-group-0-A-1-B
            · · └─┬ C GROUP id:c
            · · · └── D LEAF id:d
        `);

        api.applyTransaction({ remove: [rowC] });
        api.applyTransaction({ remove: [rowD] });

        await flushJestTimers();

        new TreeDiagram(api, '', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            └── A LEAF id:a
        `);

        const rows = getAllRows(api);

        expect(rows.length).toBe(1);
        expect(rows[0].data).toEqual(rowA);
    });

    describe('remove re-insert filler', () => {
        test('ag-grid tree sync remove re-insert filler', async () => {
            // This is actually a very important test. This proves that the implementation is commutative,
            // i.e. the grouping of the remove and insert operations does not matter.
            // i.e. executing a remove-add in the same transaction, in multiple async transactions followed by a single commit,
            // or in isolated transactions does not change the final resulting order of the rows.

            const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
            const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
            const rowD = { id: 'd', orgHierarchy: ['D'] };

            const rowData = [rowB, rowC, rowD];

            jest.useFakeTimers({ advanceTimers: true });

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
                treeData: true,
                animateRows: false,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.orgHierarchy,
            });

            new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A
                │ ├── B LEAF id:b
                │ └── C LEAF id:c
                └── D LEAF id:d
            `);

            api.applyTransaction({ remove: [rowB, rowC] });

            new TreeDiagram(api, 'Transaction[0]', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                └── D LEAF id:d
            `);

            api.applyTransaction({ add: [rowC, rowB] });

            await flushJestTimers();

            new TreeDiagram(api, 'finalSync', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                ├── D LEAF id:d
                └─┬ A filler id:row-group-0-A
                · ├── C LEAF id:c
                · └── B LEAF id:b
            `);
        });

        test('ag-grid tree same transaction remove re-insert filler', async () => {
            const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
            const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
            const rowD = { id: 'd', orgHierarchy: ['D'] };

            const rowData = [rowB, rowC, rowD];

            jest.useFakeTimers({ advanceTimers: true });

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
                treeData: true,
                animateRows: false,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.orgHierarchy,
            });

            new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A
                │ ├── B LEAF id:b
                │ └── C LEAF id:c
                └── D LEAF id:d
            `);

            api.applyTransaction({
                remove: [rowB, rowC],
                add: [rowC, rowB],
            });

            await flushJestTimers();

            new TreeDiagram(api, 'finalTogether', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                ├── D LEAF id:d
                └─┬ A filler id:row-group-0-A
                · ├── C LEAF id:c
                · └── B LEAF id:b
            `);
        });

        test('ag-grid tree async remove re-insert filler', async () => {
            // This is actually a very important test. This proves that the implementation is commutative,
            // i.e. the grouping of the remove and insert operations does not matter.
            // i.e. executing a remove-add in the same transaction, in multiple async transactions followed by a single commit,
            // or in isolated transactions does not change the final resulting order of the rows.

            const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
            const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
            const rowD = { id: 'd', orgHierarchy: ['D'] };

            const rowData = [rowB, rowC, rowD];

            jest.useFakeTimers({ advanceTimers: true });

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
                treeData: true,
                animateRows: false,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.orgHierarchy,
            });

            new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A
                │ ├── B LEAF id:b
                │ └── C LEAF id:c
                └── D LEAF id:d
            `);

            await executeTransactionsAsync([{ remove: [rowB, rowC] }, { add: [rowC, rowB] }], api);

            await flushJestTimers();

            new TreeDiagram(api, 'finalAsync', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                ├── D LEAF id:d
                └─┬ A filler id:row-group-0-A
                · ├── C LEAF id:c
                · └── B LEAF id:b
            `);
        });
    });

    test.each(['sync', 'async', 'together'] as const)('ag-grid tree %s remove re-insert filler', async (mode) => {
        // This is actually a very important test. This proves that the implementation is commutative,
        // i.e. the grouping of the remove and insert operations does not matter.
        // i.e. executing a remove-add in the same transaction, in multiple async transactions followed by a single commit,
        // or in isolated transactions does not change the final resulting order of the rows.

        const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
        const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
        const rowD = { id: 'd', orgHierarchy: ['D'] };

        const rowData = [rowB, rowC, rowD];

        jest.useFakeTimers({ advanceTimers: true });

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A
            │ ├── B LEAF id:b
            │ └── C LEAF id:c
            └── D LEAF id:d
        `);

        const transactions: RowDataTransaction[] = [{ remove: [rowB, rowC] }, { add: [rowC, rowB] }];

        if (mode === 'async') {
            await executeTransactionsAsync(transactions, api);
        } else if (mode === 'together') {
            api.applyTransaction({ ...transactions[0], ...transactions[1] });
        } else {
            api.applyTransaction(transactions[0]);

            new TreeDiagram(api, 'Transaction[0]', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                └── D LEAF id:d
            `);

            api.applyTransaction(transactions[1]);
        }

        await flushJestTimers();

        new TreeDiagram(api, 'final' + mode, treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├── D LEAF id:d
            └─┬ A filler id:row-group-0-A
            · ├── C LEAF id:c
            · └── B LEAF id:b
        `);
    });

    test.each(['sync', 'async', 'together'] as const)('ag-grid tree %s remove re-insert', async (mode) => {
        const rowB = { id: 'b', orgHierarchy: ['A', 'B', 'B'] };
        const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
        const rowD = { id: 'd', orgHierarchy: ['A', 'D'] };
        const rowE = { id: 'e', orgHierarchy: ['A', 'E', 'E'] };
        const rowF = { id: 'f', orgHierarchy: ['F'] };

        const rowData = [rowB, rowC, rowD, rowE, rowF];

        jest.useFakeTimers({ advanceTimers: true });

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        new TreeDiagram(api, 'initial', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A
            │ ├─┬ B filler id:row-group-0-A-1-B
            │ │ └── B LEAF id:b
            │ ├── C LEAF id:c
            │ ├── D LEAF id:d
            │ └─┬ E filler id:row-group-0-A-1-E
            │ · └── E LEAF id:e
            └── F LEAF id:f
        `);

        const transactions1: RowDataTransaction[] = [
            { remove: [{ id: 'e' }, { id: 'c' }, { id: 'd' }] },
            { add: [rowC, rowE, rowD] },
        ];

        if (mode === 'async') {
            await executeTransactionsAsync(transactions1, api);
        } else if (mode === 'together') {
            api.applyTransaction({ ...transactions1[0], ...transactions1[1] });
        } else {
            api.applyTransaction(transactions1[0]);

            new TreeDiagram(api, 'Transaction1[0]', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A
                │ └─┬ B filler id:row-group-0-A-1-B
                │ · └── B LEAF id:b
                └── F LEAF id:f
            `);

            api.applyTransaction(transactions1[1]);
        }

        new TreeDiagram(api, 'Transactions1 ' + mode, treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A
            │ ├─┬ B filler id:row-group-0-A-1-B
            │ │ └── B LEAF id:b
            │ ├── C LEAF id:c
            │ ├─┬ E filler id:row-group-0-A-1-E
            │ │ └── E LEAF id:e
            │ └── D LEAF id:d
            └── F LEAF id:f
        `);

        const transactions2 = [{ remove: [rowC, rowB, rowE, rowD] }, { add: [rowB, rowC, rowD, rowE] }];

        if (mode === 'async') {
            await executeTransactionsAsync(transactions2, api);
        } else if (mode === 'together') {
            api.applyTransaction({ ...transactions2[0], ...transactions2[1] });
        } else {
            api.applyTransaction(transactions2[0]);

            new TreeDiagram(api, 'Transaction2[0]', treeDiagramOptions).check(`
                ROOT_NODE_ID ROOT id:ROOT_NODE_ID
                └── F LEAF id:f
            `);

            api.applyTransaction(transactions2[1]);
        }

        await flushJestTimers();

        new TreeDiagram(api, 'Transactions2 ' + mode, treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├── F LEAF id:f
            └─┬ A filler id:row-group-0-A
            · ├─┬ B filler id:row-group-0-A-1-B
            · │ └── B LEAF id:b
            · ├── C LEAF id:c
            · ├── D LEAF id:d
            · └─┬ E filler id:row-group-0-A-1-E
            · · └── E LEAF id:e
        `);
    });
});
