import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const VueExample = {
    template: `
      <div style="height: 100%">
          <ag-grid-vue
              style="width: 100%; height: 45%;"
              class="ag-theme-alpine"
              ref="topGrid"
              :gridOptions="topOptions"
              :columnDefs="columnDefs"
              :defaultColDef="defaultColDef"
              :rowData="rowData">
          </ag-grid-vue>
          <div style='height: 5%'></div>
          <ag-grid-vue
              style="width: 100%; height: 45%;"
              class="ag-theme-alpine"
              ref="bottomGrid"
              :gridOptions="bottomOptions"
              :columnDefs="columnDefs"
              :defaultColDef="defaultColDef"
              :rowData="rowData">
          </ag-grid-vue>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            topOptions: {
                alignedGrids: () => [this.$refs.bottomGrid],
                defaultColDef: {
                    sortable: true,
                    resizable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 120
                },
                autoSizeStrategy: {
                    type: 'fitGridWidth'
                },
            },
            bottomOptions: {
                alignedGrids: () => [this.$refs.topGrid],
                defaultColDef: {
                    sortable: true,
                    resizable: true,
                    filter: true,
                    flex: 1,
                    minWidth: 120
                }
            },
            topGridApi: null,
            bottomGridApi: null,
            columnDefs: [
                {
                    headerName: 'Group 1',
                    groupId: 'Group1',
                    children: [
                        { field: 'athlete', pinned: true },
                        { field: 'age', pinned: true, columnGroupShow: 'open' },
                        { field: 'country' },
                        { field: 'year', columnGroupShow: 'open' },
                        { field: 'date' },
                        { field: 'sport', columnGroupShow: 'open' }
                    ]
                },
                {
                    headerName: 'Group 2',
                    groupId: 'Group2',
                    children: [
                        { field: 'athlete', pinned: true },
                        { field: 'age', pinned: true, columnGroupShow: 'open' },
                        { field: 'country' },
                        { field: 'year', columnGroupShow: 'open' },
                        { field: 'date' },
                        { field: 'sport', columnGroupShow: 'open' },
                    ]
                }
            ],
            defaultColDef: {
                resizable: true
            },
            rowData: null
        };
    },
    mounted() {
        this.topGridApi = this.$refs.topGrid.api;
        this.bottomGridApi = this.$refs.bottomGrid.api;

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(rowData => {
                this.rowData = rowData

                // mix up some columns
                this.topGridApi.moveColumnByIndex(11, 4);
                this.topGridApi.moveColumnByIndex(11, 4);
            });
    },
};

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample,
    },
});
