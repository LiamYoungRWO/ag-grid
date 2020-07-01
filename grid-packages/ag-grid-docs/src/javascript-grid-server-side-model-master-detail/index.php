<?php
$pageTitle = "Server-Side Row Model - Master Detail";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Master Detail</h1>

<p class="lead">
    This section shows how the Server-Side Row Model can be configured with a Master / Detail view.
</p>

<p>
    The ability to nest grids within grids is commonly referred to as Master / Detail. Here the top-level grid is
    referred to as the 'master grid' and the nested grid is referred to as the 'detail grid'.
</p>

<p>
    As this server-side version of Master / Detail is configured in the same way as its client-side counterpart, this
    guide will focus on areas that are of particular interest to this server-side version.
<p>

<note>
    For a comprehensive look at Master / Detail configurations, see: <a href="../javascript-grid-master-detail/">Client-Side Master / Detail</a>.
</note>

<h2>Enabling Master / Detail</h2>

<p>
    To enable Master / Detail, you should set the following grid options:
</p>

<ul class="content">
    <li>
        <b>masterDetail:</b> Set to <code>true</code> to inform the grid you want to allow
        expanding of rows to reveal detail grids.
    </li>
    <li>
        <b>detailGridOptions:</b> The grid options to set for the detail grid.
        The detail grid is a fully featured instance of ag-Grid, so any configuration
        can be set on the detail grid that you would set any other grid.
    </li>
    <li>
        <b>getDetailRowData:</b> A function you implement to provide the grid
        with rows for display in the detail grids.
    </li>
</ul>

<p>
    These grid options are illustrated below:
</p>

<?= createSnippet(<<<SNIPPET
var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,

    // enable master detail
    masterDetail: true,

    // specify params for default detail cell renderer
    detailCellRendererParams: {
        // provide detail grid options
        detailGridOptions: detailGridOptions,

        // extract and supply row data for detail
        getDetailRowData: function(params) {
            params.successCallback(params.data.childRecords);
        }
    }
}

var detailGridOptions = {
    columnDefs: detailColumnDefs
}
SNIPPET
) ?>

<note>Note that the nested detail grid can be configured to use any Row Model.</note>

<h2>Example: Infinite Scrolling with Master / Detail</h2>

<p>
    This example shows a simple Master / Detail setup which includes the infinite scrolling capabilities provided
    with the Server-Side Row Model. From this example notice the following:
</p>

<ul class="content">
    <li><b>masterDetail</b> - is set to <code>true</code> in the master grid options.</li>
    <li><b>detailCellRendererParams</b> - specifies the <code>detailGridOptions</code> to use and <code>getDetailRowData</code>
        extracts the data for the detail row.</li>
    <li><b>cellRenderer: 'agGroupCellRenderer'</b> - is used to provide expand / collapse icons on the master rows.</li>
</ul>

<?= grid_example('Infinite Scrolling with Master / Detail', 'infinite-scrolling', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['lodash'], 'modules' => ['serverside', 'clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Combining Row Grouping with Master Detail</h2>

<p>
    It is possible to combine <a href="../javascript-grid-server-side-model-grouping/">Server-Side Grouping</a>
    with Master Detail.
</p>

<p>
    The following snippet shows row grouping on the 'country' column by setting <code>rowGroup = true</code>:
</p>

<?= createSnippet(<<<SNIPPET
columnDefs = [
    { field: 'country', rowGroup: true },

    // ... more colDefs
]
SNIPPET
) ?>

<h2>Example: Row Grouping with Master Detail</h2>

<p>
    Below shows Row Grouping combined with Master / Detail. From the example you can notice the following:
</p>

<ul class="content">
    <li><b>rowGroup</b> - is set to <code>true</code> on the 'country' column definition.</li>
    <li><b>masterDetail</b> - is set to <code>true</code> to enable Master / Detail.</li>
    <li><b>detailCellRendererParams</b> - specifies the <code>detailGridOptions</code> to use and <code>getDetailRowData</code>
        extracts the data for the detail row.</li>
    <li><b>autoGroupColumnDef</b> - is used to specify which column in the master row should be included in the group hierarchy.</li>
</ul>

<?= grid_example('Row Grouping with Master Detail', 'row-grouping', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'clientside', 'masterdetail', 'rowgrouping', 'menu', 'columnpanel']]) ?>

<h3>Expanding Master Rows</h3>

<p>
    Normally parent rows (groups) can be expanded and child rows cannot be expanded (unless they are themselves parents).
    This means that normally only parent rows have expand / collapse icons.
</p>

<p>
    For Master / Detail, expand and collapse icons are also needed at the master level. When doing Master / Detail, expand
    and collapse icons are also needed to expand the child rows where those rows are also master rows.
</p>

<p>
    Rather than use the <code>autoGroupColumnDef</code> for the master rows as shown in the example above, simply
    specify a group cell renderer on the column that should show the expand / collapse icons.
</p>

<p>
    This is shown in the code snippet below:
</p>

<?= createSnippet(<<<SNIPPET
columnDefs = [
    { field: 'country', rowGroup: true },
    { field: 'accountId', maxWidth: 200, cellRenderer: 'agGroupCellRenderer' },
    // ... more colDefs
]
SNIPPET
) ?>

<h2>Detail Row Height</h2>

<p>
    The height of detail rows can be configured in one of the following two ways:
</p>

<ol class="content">
    <li>
        Use property <code>detailRowHeight</code> to set a fixed height for each detail row.
    </li>
    <li>
        Use callback <code>getRowHeight()</code> to explicitly set height for each row individually.
        The callback must work out how many pixels high each detail row should be.
    </li>
    <li>
        Set <code>detailCellRendererParams.autoHeight=true</code> to get the grid to automatically size
        the detail grids to fit their rows.
    </li>
</ol>

<p>
    The following snippet compares all approaches:
</p>

<?= createSnippet(<<<SNIPPET
// option 1 - fixed detail row height, sets height for all details rows
masterGridOptions.detailRowHeight = 500;

// option 2 - dynamic detail row height, dynamically sets height for all rows
masterGridOptions.getRowHeight = function(params) {
    var isDetailRow = params.node.detail;

    // not that this callback gets called for all rows, not just the detail row
    if (isDetailRow) {
        // dynamically calculate detail row height
        return params.data.children.length * 50;
    } else {
        // for all non-detail rows, return 25, the default row height
        return 25;
    }
}

// option 2 - use autoHeight
masterGridOptions.detailCellRendererParams.autoHeight = true;

SNIPPET
) ?>

<note>
    Purging the cache and dynamic row heights do not work together for the Server-Side Row Model.
    If you are using dynamic row height, ensure <code>maxBlocksInCache</code> is not set.
</note>

<h3>Example Using Callback <code>getRowHeight()</code></h3>

<p>
    The following example explicitly sets detail row heights based on the number of detail rows.
    Note the following:
</p>

<ul class="content">
    <li><b>getRowHeight()</b> - is implemented to size detail rows according to the number of records.</li>
    <li><b>node.detail</b> - is used to identify 'detail' row nodes.</li>
</ul>

<?= grid_example('Dynamic Detail Row Height', 'dynamic-detail-row-height', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    See <a href="../javascript-grid-master-detail-height/#dynamic-height">Master Detail Dynamic Height</a>
    for more details.
</p>

<h3>Example Using Property <code>autoHeight</code></h3>

<p>
    The following example gets the grid to auto-size all details sections to fit their rows. This is done
    by setting <code>masterGridOptions.detailCellRendererParams.autoHeight = true</code>.
</p>

<?= grid_example('Auto Detai Row Height', 'auto-detail-row-height', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    See <a href="../javascript-grid-master-detail-height/#auto-height">Master Detail Auto Height</a> for more
    details.
</p>

<h2>Lazy Loading Detail Rows</h2>

<p>
    In the examples above, the data for the detail grid was returned with the master row. However it is also possible
    to lazy-load data for the detail row, see:
    <a href="../javascript-grid-master-detail-detail-grids/#providing-rows">Providing Rows</a>.
</p>

<p>
    However note that detail rows will be purged once the master row is closed, or if the detail row leaves the viewport
    through scrolling. In both cases data will need to be fetched again.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to work with
    <a href="../javascript-grid-server-side-model-tree-data/">Tree Data</a> when using the Server-Side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
