//--- Variables ---

// References to Table and Cells
const table = document.getElementById("table").getElementsByTagName("tbody")[0]
var row_amount = document.getElementById("table").rows.length; // Number of rows in table
var rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table
var cell;

var variables_values = []
var population_values = []
var cumulative_values = []

var variable_type
var mode;
var median;
var average;
var min;
var Q1;
var Q3;
var max;

var mouse_is_down = false
var is_discrete = false

// Columns
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

window.addEventListener("selectstart", function(event) 
{
    event.preventDefault();
});

document.addEventListener("mouseup", function() 
{
    mouse_is_down = false;
});

document.addEventListener('keydown', function(event) 
{
    if (event.key == "Tab")
    {
        event.preventDefault()

        add_row()
    }

    if (event.key == "Enter") 
    {
        // Loop through rows
        for (let r = 0; r < row_amount; r++) 
        {        
            let row = rows[r];
            let nextCell 

            // Loop through cells within each row
            for (let c = 0; c < row.cells.length; c++) 
            {
                let cell = row.cells[c]?.querySelector("input");

                if (cell === document.activeElement) 
                {
                    // Determine next cell
                    if (c + 1 < 2)
                    {
                        nextCell = (c + 1 < row.cells.length) ? row.cells[c + 1]?.querySelector("input") : null;
                    }                    

                    if (!nextCell && r + 1 < row_amount) 
                    {
                        nextCell = rows[r + 1].cells[0]?.querySelector("input"); // Move to the first cell of the next row if possible
                    }

                    // Move focus to the next cell if available
                    if (nextCell)
                    {
                        nextCell.focus();
                        return; // Stop further processing
                    }
                }
            }
        }
    }
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//--- Functions ---

// Function Updates Every Cell Value
function refresh_table()
{
    // Sets Cells to Empty
    for(let f = 0; f < 4; f++)
    {
        columns[f].cells = []
    }    

    // Adds Cells to Rows Object
    access_cells();

    calculate_total_population()
    calculate_cell_percentage()
    calculate_total_percentage()
    calculate_cell_cumulative()
}

// Function to Initialise Rows and to Add On Button Press
function add_row() 
{
    var newRow = table.insertRow();

    // Add Cells
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    
    var buttonCell = newRow.insertCell(4);

    buttonCell.innerHTML = 
    `    
    <div class= "row_button_container">
        <div class= "move_buttons" id= "move_buttons">
            <button class= "row_button" id="row_button_up"   onmousedown="mouse_is_down = true; drag_row(this.parentNode.parentNode.parentNode.parentNode)" onmouseup="mouse_is_down = false">˄</button>
            <button class= "row_button" id="row_button_down" onmousedown="mouse_is_down = true; drag_row(this.parentNode.parentNode.parentNode.parentNode)" onmouseup="mouse_is_down = false">˅</button>
        </div>

        <button class="row_button" onclick="delete_row(this.parentNode.parentNode.parentNode)">-</button>
    </div>
    `;

    // Set Cell Parameters
    cell1.innerHTML = '<input type="text" name="variable_value_cell" class="cell" id="variable_cell" placeholder="Variable Value" required autocomplete="off" min=0>';
    cell2.innerHTML = '<input type="number" name="population_value_cell" class="cell" id="population_cell" placeholder="Population Value" required autocomplete="off" min=0>';
    cell3.innerHTML = '<input type="number" name="percentage_value_cell" class="cell" id="percentage_cell" placeholder="Percentage" required autocomplete="off" readonly min=0>';
    cell4.innerHTML = '<input type="number" name="cumulative_percentage_value_cell" class="cell" id="cumulative_cell" placeholder="Cumulative Percentage" required autocomplete="off" readonly min=0>';

    row_amount = document.getElementById("table").rows.length;
    rows = document.getElementById("table").rows;

    refresh_table()

    // Adds Increment to Variable Column While Adding Rows
    var variable_amount = Number(variables_column.cells.length)
    var step = 0

    for(let m = 0; m < variable_amount; m++)
    {
        if(isNaN(Number(variables_column.cells[m].value)))
        {
            break
        }        

        // Check if New Cell and Two Previous Cells Are Empty
        if(variables_column.cells[variable_amount - 3] != undefined && variables_column.cells[variable_amount - 2] != undefined && variables_column.cells[variable_amount - 1] != undefined)
        {
            if(variables_column.cells[variable_amount - 3].value != "" && variables_column.cells[variable_amount - 2].value != "")
            {
                // Determines What to Increment Cells by
                step = variables_column.cells[variable_amount - 2].value - variables_column.cells[variable_amount - 3].value   

                variables_column.cells[variable_amount - 1].value = Number(variables_column.cells[variable_amount - 2].value) + step              
            }             
        }                     
    }

    add_event_listener_to_cell();
    refresh_table();
}

function clear_table()
{
    row_amount = Array.from(document.getElementById("table").rows).length; // Number of rows in table
    rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table


    for (let r = 1; r <= row_amount - 2; r++) //Loop Through Rows
    {        
        for (let c = 0; c < 2; c++) //Loop Through Cells
        {
            var row = rows[r];

            if (row) //Check if the Row Exists
            { 
                cell = row.cells[c]?.querySelector("input"); //Check if Cell Exists

                cell.value = null
            }
        }
    }

    refresh_table()
}


function delete_row(row)
{
    table.deleteRow(row.rowIndex - 1); // Adjusts for header row if any

    row_amount = document.getElementById("table").rows.length;
    rows = document.getElementById("table").rows;

    refresh_table(); // Recalculate totals and percentages after deletion
}

function drag_row(row) 
{ 
    function onMouseMove(event) 
    {
        highlight_closest_row(event.pageY);
    }

    function onMouseUp(event) 
    {
        move_row(row, highlight_closest_row(event.pageY))      
    
        // Remove the mousemove and mouseup listeners when dragging ends
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    // Add mousemove and mouseup listeners when drag starts
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function highlight_closest_row(dragRowY) 
{
    rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table
    let closestRow = null;
    let closestDistance = Infinity;

    rows.pop()
    rows.shift()

    rows.forEach(row =>
        {
            const rect = row.getBoundingClientRect();
            const rowY = rect.top + rect.height / 2;
            const distance = Math.abs(rowY - dragRowY);
    
            if (distance < closestDistance) 
            {
                closestDistance = distance;
                closestRow = row;
            }
        });

    rows.forEach(row => row.style.backgroundColor = '');

    if (closestRow) 
    {
        closestRow.style.backgroundColor = 'lightgreen';
    }

    index = closestRow.rowIndex - 1
    return index
}

function move_row(row, index)
{
    rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table

    if (index != row.rowIndex - 1)
    {     
        if (index >= 0 && index <= row_amount - 3)
        {
            var row1 = row //Start
            var row2 = table.children[index]//Destination
            var temp_row = document.createElement("temp_row")

                           //Start    //Destination
            table.replaceChild(temp_row , row1)
            table.replaceChild(row1, row2)
            table.replaceChild(row2, temp_row) 

            
            refresh_table(); // Recalculate totals and percentages after moving
        }
    }

    rows.forEach(row => row.style.backgroundColor = '');
}

//Adds Cells to Rows Object
function access_cells() 
{    
    row_amount = Array.from(document.getElementById("table").rows).length; // Number of rows in table
    rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table


    for (let r = 0; r <= row_amount; r++) //Loop Through Rows
    {        
        for (let c = 0; c < 4; c++) //Loop Through Cells
        {
            var row = rows[r - 1];

            if (row) //Check if the Row Exists
            { 
                cell = row.cells[c]?.querySelector("input"); //Check if Cell Exists

                if (cell.value < 0 && c == 1)
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
    
    for (let r = 0; r < population_column.cells.length; r++) 
    {
        let cellValue = Number(population_column.cells[r].value);

        if (isNaN(cellValue) || cellValue == null) 
        {             
            // If cell value is not a number, set percentage to null
            percentage_column.cells[r].value = null;
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
                percentage_column.cells[r].value = null;  // Handle NaN case
            }
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
    for (let r = 0; r < percentage_column.cells.length; r++) 
    {
        let cellValue = Number(percentage_column.cells[r].value);
            
        if (isNaN(cellValue) || cellValue == null) 
        {             
            // If cell value is not a number, set percentage to an empty string or null
            cumulative_column.cells[r].value = null;
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

function calculate_descriptive_statistics()
{
    row_amount = Array.from(document.getElementById("table").rows).length; // Number of rows in table
    rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table

    variables_values = []
    population_values = []
    cumulative_values = []

    variable_type = "discrete"
    is_discrete = false

    for (let r = 2; r <= row_amount - 1; r++) //Loop Through Rows
    {        
        var row = rows[r - 1];

        if (row) //Check if the Row Exists
        { 
            if (row.cells[0])
            {
                let cell = row.cells[0].querySelector("input")

                variables_values.push(cell.value)  
                
                if (variable_type != "categorical")
                {
                    find_variable_type(cell.value)
                }
            }

            if (row.cells[1])
            {
                let cell = row.cells[1].querySelector("input")    
                
                population_values.push(cell.value)
            }

            if (row.cells[3])
            {
                let cell = row.cells[3].querySelector("input")    
                    
                cumulative_values.push(cell.value)
            }
        }        
    }

    calculate_mode()
}

function find_variable_type(variable_value)
{
    if (!isNaN(variable_value) && variable_type == "continuous")
    {
        variable_type = "categorical"
    }

    else if (isNaN(variable_value))
    {
        variable_value = String(variable_value).replaceAll(" ", "");

        if (variable_value[0] == "[" && variable_value[variable_value.length - 1] == "[")
        {
            if (is_discrete)
            {
                variable_type = "categorical"
                return
            }

            variable_value = variable_value.slice(1)
            let comma_index = variable_value.indexOf(",");

            // Get Category Bounds
            let lower_bound = Number(variable_value.slice(0, comma_index));
            let upper_bound = Number(variable_value.slice(comma_index + 1, -1));

            if (!isNaN(lower_bound) && !isNaN(upper_bound))
            {
                variable_type = "continuous"
            };
        }

        else
        {
            variable_type = "categorical"
        }
    }

    else
    {
        is_discrete = true
    }
};

function calculate_mode()
{
    if (variable_type == "continuous")
    {
        mode = []
        let mode_index = []
        let mode_variable = []
        let largest_population = 0

        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            if (Number(population_values[i]) > largest_population)
            {
                largest_population = Number(population_values[i])

                mode_index = []
                mode = []
                mode_variable = []

                mode_index.push(i)
                mode.push(largest_population)
                mode_variable.push(variables_values[i])
            }

            else if (population_values[i] == largest_population)
            {
                mode_index.push(i)
                mode.push(largest_population)
                mode_variable.push(variables_values[i])
            }
        } 

        
        for (let m = 0; m < mode.length; m++)
        {   
            mode_variable[m] = mode_variable[m].slice(1)
            let comma_index = mode_variable[m].indexOf(",");

            // Get Category Bounds
            let lower_bound = Number(mode_variable[m].slice(0, comma_index));
            let upper_bound = Number(mode_variable[m].slice(comma_index + 1, -1));

            let h = upper_bound - lower_bound            
            let ƒm = mode[m]
            let ƒm1 = mode_index[m] > 0 ? population_values[mode_index[m] - 1] : 0;
            let ƒm2 = mode_index[m] < population_values.length - 1 ? population_values[mode_index[m] + 1] : 0;

            mode[m] = isNaN((lower_bound + (( (ƒm - ƒm1) / ( (ƒm - ƒm1) + (ƒm - ƒm2) )) * h)).toFixed(1)) ? (lower_bound + (0.5 * h)).toFixed(1) : (lower_bound + (( (ƒm - ƒm1) / ( (ƒm - ƒm1) + (ƒm - ƒm2) )) * h)).toFixed(1)
        }
    }

    else
    {
        let largest_population = 0

        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            if (Number(population_values[i]) > largest_population)
            {
                largest_population = Number(population_values[i])

                mode = ""
                mode = String(variables_values[i])
            }

            else if (population_values[i] == largest_population)
            {
                mode += ", "
                mode += String(variables_values[i])
            }     
        }
    }
}

function calculate_median()
{
    let median_index = 0;

    for(let i = 0; i <= cumulative_values.length - 1; i++)
    {
        if (cumulative_values[i] >= 50)
        {
            median_index = i;
            break;
        }
    }

    median = String(variables_values[median_index])
}

function calculate_average()
{
    let average = 0
    
    for(let i = 0; i <= variables_values.length - 1; i++)
    {
        average += variables_values[i] * population_values[i]
    }

    average = String((average / population_column.footer.value).toFixed(1))
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//Checks for Changes in Cells
function add_event_listener_to_cell() 
{
    table.addEventListener("input", (e) => 
    {
        if (e.target && e.target.matches("input")) 
        {
            on_cell_update(e.target);
        }
    });

    document.querySelectorAll("#variable_cell").forEach(input => { input.addEventListener("click", () => { input.select() }) });
    document.querySelectorAll("#population_cell").forEach(input => { input.addEventListener("click", () => { input.select() }) });
}

//Function that Gets Called when Cells Update
function on_cell_update(cell)
{    
    refresh_table()
}

function get_started()
{
    table.scrollIntoView({behavior: "smooth"});
}