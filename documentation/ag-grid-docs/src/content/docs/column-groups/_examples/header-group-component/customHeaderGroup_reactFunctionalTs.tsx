import { CustomHeaderGroupProps } from '@ag-grid-community/react';
import React, { useEffect, useState } from 'react';

export default (props: CustomHeaderGroupProps) => {
    const [expandState, setExpandState] = useState('collapsed');

    const expandOrCollapse = () => {
        let currentState = props.columnGroup.getProvidedColumnGroup().isExpanded();
        props.setExpanded(!currentState);
    };

    const syncExpandButtons = () => {
        setExpandState(props.columnGroup.getProvidedColumnGroup().isExpanded() ? 'expanded' : 'collapsed');
    };

    useEffect(() => {
        props.columnGroup.getProvidedColumnGroup().addEventListener('expandedChanged', syncExpandButtons);
        syncExpandButtons();

        return () => {
            props.columnGroup.getProvidedColumnGroup().removeEventListener('expandedChanged', syncExpandButtons);
        };
    }, []);

    return (
        <div className="ag-header-group-cell-label">
            <div className="customHeaderLabel">{props.displayName}</div>
            <div className={`customExpandButton ${expandState}`} onClick={() => expandOrCollapse()}>
                <i className="fa fa-arrow-right"></i>
            </div>
        </div>
    );
};
