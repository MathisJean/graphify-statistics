//--- Variables ---

var row_amount = document.getElementById("table").rows.length; //Number of rows in table
var rows = document.getElementById("table").rows; //Reference to the rows in the table
var cell;

//Columns
var variables_column = 
{
    header: [],
    cells: [],
    footer: [],
};

var population_column = 
{
    header: [],
    cells: [],
    footer: [],
};

var percentage_column = 
{
    header: [],
    cells: [],
    footer: [],
};

var cumulative_column = 
{
    header:[],
    cells: [],
    footer: [],
};

var columns = [];



//--- Script ---

add_columns_to_array(variables_column)
add_columns_to_array(population_column)
add_columns_to_array(percentage_column)
add_columns_to_array(cumulative_column)

add_row()



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//--- Functions ---

//Function Updates Every Cell Value
function refresh_table()
{
    //Sets Cells to Empty
    for(let f = 0; f < 4; f++)
    {
        columns[f].cells = []
    }    

    //Adds Cells to Rows Object
    access_cells();

    calculate_total_population()
    calculate_cell_percentage()
    calculate_total_percentage()
    calculate_cell_cumulative()
}

//Function to Initialise Rows and to Add On Button Press
function add_row() 
{
    //References to Table and Cells
    var table = document.getElementById("table").getElementsByTagName("tbody")[0];

    var newRow = table.insertRow();

    var buttonCell = newRow.insertCell(0);

    buttonCell.innerHTML = 
    `
    <button class="row-action-button" onclick="delete_row()">-</button>
    <button class="row-action-button">˄</button>
    <button class="row-action-button">˅</button>
    `;

    //Add Cells
    var cell1 = newRow.insertCell(1);
    var cell2 = newRow.insertCell(2);
    var cell3 = newRow.insertCell(3);
    var cell4 = newRow.insertCell(4);

    //Set Cell Parameters
    cell1.innerHTML = '<input type="text" name="variable_value_cell" class="cell" placeholder="Variable Value" required autocomplete="off" min=0>';
    cell2.innerHTML = '<input type="number" name="population_value_cell" class="cell" placeholder="Population Value" required autocomplete="off" min=0>';
    cell3.innerHTML = '<input type="number" name="percentage_value_cell" class="cell" placeholder="Percentage" required autocomplete="off" readonly min=0>';
    cell4.innerHTML = '<input type="number" name="cumulative_percentage_value_cell" class="cell" placeholder="Cumulative Percentage" required autocomplete="off" readonly min=0>';

    row_amount = document.getElementById("table").rows.length;
    rows = document.getElementById("table").rows;

    //Sets Cells to Empty
    for(let f = 0; f < 4; f++)
    {
        columns[f].cells = []
    }

    //Adds Cells to Rows Object
    access_cells();

    //Adds Increment to Variable Column While Adding Rows
    var variable_amount = Number(variables_column.cells.length)
    var step = 0

    for(let m = 0; m < variable_amount; m++)
    {
        if(isNaN(Number(variables_column.cells[m].value)))
        {
            break
        }

        //Check if New Cell and Two Previous Cells Are Empty
        if(variables_column.cells[variable_amount - 3] != undefined && variables_column.cells[variable_amount - 2] != undefined && variables_column.cells[variable_amount - 1] != undefined)
        {
            //Determines What to Increment Cells by
            step = variables_column.cells[variable_amount - 2].value - variables_column.cells[variable_amount - 3].value   

            //Check That Previous Cell Isn't Zero
            if(Number(variables_column.cells[variable_amount - 2].value) != 0)
            {
                variables_column.cells[variable_amount - 1].value = Number(variables_column.cells[variable_amount - 2].value) + step
            }                 
        }                     
    }

    add_event_listener_to_cell()
    calculate_total_population()
}

function delete_row()
{
    var table = document.getElementById("table").getElementsByTagName("tbody")[0];

    table.deleteRow(0)
}

//Adds Cells to Rows Object
function access_cells() 
{    
    for (let r = 0; r <= row_amount; r++) //Loop Through Rows
    {        
        for (let c = 0; c < 4; c++) //Loop Through Cells
        {
            var row = rows[r - 1];

            if (row) //Check if the Row Exists
            { 
                cell = row.cells[c]?.querySelector('input'); //Check if Cell Exists

                if (cell.value < 0)
                {
                    cell.value = 0
                }

                if(r == 1)
                {
                    columns[c].header = cell
                }

                else if(r == row_amount)
                {
                    columns[c].footer = cell
                }

                else
                {
                    columns[c].cells.push(cell)
                } 
            }
        }
    }
}

//Push Columns to Columns Array
function add_columns_to_array(column)
{
    columns.push(column)
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//Function to calculate the total population
function calculate_total_population() 
{
    var total = 0;

    for (let r = 0; r < population_column.cells.length; r++) 
    {
        let value = Number(population_column.cells[r].value);
        
        if (!isNaN(value)) 
        {
            total += value;
        }
    }

    population_column.footer.value = total;  //Update footer
    return total;
}

//Sets the Percentage Value of According Cells
function calculate_cell_percentage() 
{
    // Ensure footer value is a valid number and greater than 0
    let totalPopulation = Number(population_column.footer.value);
    
    if (totalPopulation > 0) 
    {

        for (let r = 0; r < population_column.cells.length; r++) 
        {
            let cellValue = Number(population_column.cells[r].value);

            console.log(cellValue)
            
            if (isNaN(cellValue) || cellValue == null) 
            {             
                // If cell value is not a number, set percentage to an empty string or null
                percentage_column.cells[r].value = "";  // Or use `null` if you prefer
            }
                
            else if (cellValue === 0)
            {
                percentage_column.cells[r].value = cellValue.toFixed(1);
            }
            
            else 
            {
                // Calculate percentage and round it
                let percentage = Math.round((cellValue / totalPopulation) * 1000) / 10;

                // Check if percentage is a valid number before assigning
                if (!isNaN(percentage)) 
                {
                    percentage_column.cells[r].value = percentage.toFixed(1);
                } 
                
                else 
                {
                    percentage_column.cells[r].value = "";  // Handle NaN case
                }
            }
        }
    } 

    else 
    {
        // Handle the case when totalPopulation is zero or invalid
        for (let r = 0; r < percentage_column.cells.length; r++) 
        {
            percentage_column.cells[r].value = "";  // Clear percentage values
        }
    }
}

//Function to calculate the total percentage
function calculate_total_percentage() 
{
    var total = 0;

    for (let r = 0; r < percentage_column.cells.length; r++) 
    {
        let value = Number( percentage_column.cells[r].value);
        
        if (!isNaN(value)) 
        {
            total += value;
        }
    }

    percentage_column.footer.value = (Math.round(total * 10) / 10).toFixed(1);  //Update footer
}

function calculate_cell_cumulative()
{
    // Ensure footer value is a valid number and greater than 0
    let totalPercentage = Number(percentage_column.footer.value);
    
    if (totalPercentage > 0) 
    {
        for (let r = 0; r < percentage_column.cells.length; r++) 
        {
            let cellValue = Number(percentage_column.cells[r].value);
            
            if (isNaN(cellValue) || cellValue == null) 
            {             
                // If cell value is not a number, set percentage to an empty string or null
                cumulative_column.cells[r].value = "";  // Or use `null` if you prefer
            }
            
            else if (cellValue === 0)
            {
                cumulative_column.cells[r].value = cellValue.toFixed(1);
            }

            else
            {
                let cumulativePercentage = 0

                for (let l = 0; l <= r; l++)
                {
                    cumulativePercentage += Number(percentage_column.cells[l].value)
                }

                cumulative_column.cells[r].value = cumulativePercentage.toFixed(1)
            }          
        }
    } 

    else 
    {
        // Handle the case when totalPopulation is zero or invalid
        for (let r = 0; r < percentage_column.cells.length; r++) 
        {
            percentage_column.cells[r].value = "";  // Clear percentage values
        }
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//Checks for Changes in Cells
function add_event_listener_to_cell() 
{
    var inputs = document.querySelectorAll('input'); //Select all input elements

    inputs.forEach(function(input) 
    {
        input.addEventListener('input', function() { on_cell_update(this); });
    });
}

//Function that Gets Called when Cells Update
function on_cell_update(cell)
{    
    refresh_table()
}

