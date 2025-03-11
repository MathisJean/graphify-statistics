// Graphify is a Programme that Generates a WebPage with a Table to Input Values, those Values will be Used to Generate a Bar Chart, Pie Chart and Descriptive Statistics
// The Table Accepts Categorical, Discrete and Continuous Variables

// This Programme has been Created by Mathis Jean [06-12-2024]

//--- Variables ---

// References to Table and Cells
const table = document.getElementById("table").getElementsByTagName("tbody")[0];
var row_amount = document.getElementById("table").rows.length; // Number of rows in table
var rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table
var cell;

var variables_values = [];
var population_values = [];
var cumulative_values = [];

var lower_bound = 0;
var upper_bound = 0;

var variable_type;
var mode = "none";
var median = "none";
var average = "none";
var quartile = [Q1, median, Q3];
var deviation = "none";
var min = "none";
var Q1 = "none";
var Q3 = "none";
var max = "none";

// Statistics Display
var mode_value = document.getElementById("mode_value");
var min_value = document.getElementById("min_value");
var quartiles_value = document.getElementById("quartiles_value");
var max_value = document.getElementById("max_value");
var average_value = document.getElementById("average_value");
var deviation_value = document.getElementById("deviation_value");

var mouse_is_down = false;
var is_discrete = false;

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

add_columns_to_array(variables_column);
add_columns_to_array(population_column);
add_columns_to_array(percentage_column);
add_columns_to_array(cumulative_column);

add_row();
add_row();

plot_graph([], [], "discrete")

// Reset Window on Reload
window.onbeforeunload = function () 
{
    window.scrollTo(0, 0);
}

// Prevent from Selecting Text in the document
window.addEventListener("selectstart", function(event) 
{
    event.preventDefault();
});

// Check if Mouse is Released
document.addEventListener("mouseup", function() 
{
    mouse_is_down = false;
});

// Skip Through Cells with Enter
document.addEventListener('keydown', function(event) 
{
    if (event.key == "Tab")
    {
        event.preventDefault();

        add_row();
        get_started(rows[row_amount - 3], event);
    }

    if (event.key == "Enter") 
    {
        event.preventDefault();

        // Loop through rows
        for (let r = 0; r < row_amount; r++) 
        {        
            let row = rows[r];
            let nextCell ;

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
                    };
                };
            };
        };
    };
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//--- Functions ---

// Function Updates Every Cell Value
function refresh_table()
{
    // Sets Cells to Empty
    for(let f = 0; f < 4; f++)
    {
        columns[f].cells = [];
    }    

    // Adds Cells to Rows Object
    access_cells();

    calculate_total_population();
    calculate_cell_percentage();
    calculate_total_percentage();
    calculate_cell_cumulative();
}

// Function to Add Rows
function add_row() 
{
    store_cell_values_array()

    var newRow = table.insertRow();

    // Add Cells
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    
    var buttonCell = newRow.insertCell(4);

    // Set Cell Parameters
    buttonCell.innerHTML = 
    `    
    <div class= "row_button_container">
        <div id= "move_buttons">
            <img class= "row_button" id="row_button_up" src=`${window.location.origin}/main/img/arrow_up.png}` onmousedown="mouse_is_down = true; drag_row(this.parentNode.parentNode.parentNode.parentNode)" onmouseup="mouse_is_down = false" draggable="false"></img>
            <img class= "row_button" id="row_button_down" src=`${window.location.origin}/main/img/arrow_down.png}` onmousedown="mouse_is_down = true; drag_row(this.parentNode.parentNode.parentNode.parentNode)" onmouseup="mouse_is_down = false" draggable="false"></img>
        </div>

        <img class="row_button" src=`${img/minus.png}` onclick="delete_row(this.parentNode.parentNode.parentNode)" draggable="false"></img>
    </div>
    `;

    cell1.innerHTML = '<input type="text" name="variable_value_cell" class="cell" id="variable_cell" placeholder="Variable Value" required autocomplete="off" min=0>';
    cell2.innerHTML = '<input type="number" name="population_value_cell" class="cell" id="population_cell" placeholder="Population Value" required autocomplete="off" min=0>';
    cell3.innerHTML = '<input type="number" name="percentage_value_cell" class="cell" id="percentage_cell" placeholder="Percentage" autocomplete="off" readonly min=0>';
    cell4.innerHTML = '<input type="number" name="cumulative_percentage_value_cell" class="cell" id="cumulative_cell" placeholder="Cumulative Percentage" autocomplete="off" readonly min=0>';

    row_amount = document.getElementById("table").rows.length;
    rows = document.getElementById("table").rows;

    refresh_table();

    // Adds Increment to Variable Column While Adding Rows
    var variable_amount = Number(variables_column.cells.length);
    var step = 0;

    // Increment for Discrete Variable
    if (variable_type == "discrete")
    {
        for(let m = 0; m < variable_amount; m++)
        {
            if(isNaN(Number(variables_column.cells[m].value)))
            {
                break;
            };  

            // Check if Cells are Empty
            if(variables_column.cells[variable_amount - 3] != undefined && variables_column.cells[variable_amount - 2] != undefined && variables_column.cells[variable_amount - 1] != undefined)
            {
                if(variables_column.cells[variable_amount - 3].value != "" && variables_column.cells[variable_amount - 2].value != "")
                {
                    // Gets the Cell Variable Increment
                    step = variables_column.cells[variable_amount - 2].value - variables_column.cells[variable_amount - 3].value;  

                    variables_column.cells[variable_amount - 1].value = Number(variables_column.cells[variable_amount - 2].value) + step;            
                };          
            };                   
        };
    }

    // Increment for Continuous Variable
    else if (variable_type == "continuous")
    {

        for(let m = 0; m < variable_amount; m++)
        {
            if(!isNaN(Number(variables_column.cells[m].value)))
            {
                break;
            };  

            // Check if Cells are Empty
            if(variables_column.cells[variable_amount - 2] != undefined && variables_column.cells[variable_amount - 1] != undefined)
            {
                if(variables_column.cells[variable_amount - 2].value != "")
                {
                    // Gets the Cell Variable Increment
                    step = upper_bound * 2 - lower_bound;

                    variables_column.cells[variable_amount - 1].value = "[" + upper_bound + ", " + step + "["  ;      
                };          
            };                   
        };
    };

    add_event_listener_to_cell();
    refresh_table();
}

// Removes Values from Table
function clear_table()
{
    var graph = document.getElementById("graph");
    var pie = document.getElementById("pie");

    var graph_title = document.getElementById("graph_title");

    var pie_data = 
    [{
        values: [1],
        labels: [""],
        textinfo: "percent",
        hoverinfo: 'label',
        type: "pie",
        marker: 
        {
            colors: ["rgb(5, 40, 60)"]
        },
    }]; 

    var pie_layout = 
    {

    }

    var pie_config = 
    {
        displayModeBar: false,
    }

    // Reset Graph and Pie
    Plotly.react(graph, [], {});

    Plotly.react(pie, [], {});
    Plotly.plot(pie, pie_data, pie_layout, pie_config)

    graph_title.value = "";
    
    row_amount = Array.from(document.getElementById("table").rows).length; // Number of rows in table
    rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table

    for (let r = 0; r <= row_amount - 2; r++) // Loop Through Rows
    {        
        for (let c = 0; c < 2; c++) // Loop Through Cells
        {
            var row = rows[r];

            if (row) // Check if the Row Exists
            { 
                cell = row.cells[c]?.querySelector("input"); // Check if Cell Exists

                cell.value = null;
            };
        };
    };

    // Reset Descriptive Statistics Display
    mode_value.textContent = "None";
    min_value.textContent = "None";
    quartiles_value.textContent = "None";
    max_value.textContent = "None";
    average_value.textContent = "None";
    deviation_value.textContent = "None";

    refresh_table();
};

// Deletes the Selected Row
function delete_row(row)
{
    table.deleteRow(row.rowIndex - 1); // Adjusts for Header Row

    row_amount = document.getElementById("table").rows.length;
    rows = document.getElementById("table").rows;

    refresh_table(); // Recalculate Table Values
}

// Function to Move Row 
function drag_row(row) 
{ 
    // When Mouse Moves Highlight Closest Row
    function onMouseMove(event) 
    {
        highlight_closest_row(event.pageY);
    }

    // On Mouse Release Swap with Desired Row
    function onMouseUp(event) 
    {
        move_row(row, highlight_closest_row(event.pageY)) ;   
    
        // Remove Event Listeners when Mouse Dragging Ends
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    // Adds Event Listeners when Mouse Dragging Starts
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
};

// Highlight Closest Row to Cursor Location 
function highlight_closest_row(dragRowY) 
{
    rows = Array.from(document.getElementById("table").rows); // Reference to the Rows in the Table
    let closestRow = null;
    let closestDistance = Infinity;

    // Remove Header and Footer from Array
    rows.shift()
    rows.pop()

    // Gets Cursor Distance From Each Row Keep the Closest
    rows.forEach(row =>
    {
        let rect = row.getBoundingClientRect();
        let rowY = rect.top + rect.height / 2 + window.scrollY;
        let distance = Math.abs(rowY - dragRowY);

        if (distance < closestDistance) 
        {
            closestDistance = distance;
            closestRow = row;
        };
    });

    // Sets Every Cells Background to Default
    rows.forEach(row => 
    { 
        for (let c = 0; c < 4; c++)
        {
            let cell = row.children[c].children[0]

            cell.style.backgroundColor = "rgb(5, 40, 60)";
            cell.style.color = "White";
            cell.classList.remove("blue-placeholder");
            cell.classList.add("default-placeholder");
        }
    });

    // Sets Closest Cells Background to Blue
    if (closestRow) 
    {
        for (let c = 0; c < 4; c++)
        {
            let cell = closestRow.children[c].children[0]

            cell.style.backgroundColor = "Blue";
            cell.style.color = "Blue";
            cell.classList.add("blue-placeholder");
            cell.classList.remove("default-placeholder");
        }
    };

    // Return the Index of the Closest Row
    index = closestRow.rowIndex - 1;
    return index;
}

// Swaps the Selected Row with the Desired One
function move_row(row, index)
{
    rows = Array.from(document.getElementById("table").rows); // Reference to the Rows in the Table

    // If the Index is in the Table
    if (index != row.rowIndex - 1)
    {     
        if (index >= 0 && index <= row_amount - 3)
        {
            var row1 = row; // Start
            var row2 = table.children[index];// Destination
            var temp_row = document.createElement("temp_row");

                            // Start   // Destination
            table.replaceChild(temp_row , row1);
            table.replaceChild(row1, row2);
            table.replaceChild(row2, temp_row);

            
            refresh_table(); // Recalculate Totals After Moving
        };
    };

    // Remove Header and Footer from Array
    rows.shift()
    rows.pop()

    // Sets Every Cells Background to Default
    rows.forEach(row => 
    { 
        for (let c = 0; c < 4; c++)
        {
            let cell = row.children[c].children[0]

            cell.style.backgroundColor = "rgb(5, 40, 60)";
            cell.style.color = "White";
            cell.classList.remove("blue-placeholder");
            cell.classList.add("default-placeholder");
        };
    });
}

// Adds Cells to Rows Object
function access_cells() 
{    
    row_amount = Array.from(document.getElementById("table").rows).length; // Number of rows in table
    rows = Array.from(document.getElementById("table").rows); // Reference to the rows in the table

    for (let r = 0; r <= row_amount; r++) // Loop Through Rows
    {        
        for (let c = 0; c < 4; c++) // Loop Through Cells
        {
            var row = rows[r - 1];

            if (row) // Check if the Row Exists
            { 
                cell = row.cells[c]?.querySelector("input"); // Check if Cell Exists

                if (cell.value < 0 && c == 1) // If Population is Negative Set Value To 0
                {
                    cell.value = 0;
                };

                // Adds Cells to Columns Array then Dictionary
                if(r == 1)
                {
                    columns[c].header = cell;
                }

                else if(r == row_amount)
                {
                    columns[c].footer = cell;
                }

                else
                {
                    columns[c].cells.push(cell);
                };
            };
        };
    };
};

// Push Columns to Columns Array
function add_columns_to_array(column)
{
    columns.push(column);
};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Function to Calculate Total Population
function calculate_total_population() 
{
    var total = 0;

    for (let r = 0; r < population_column.cells.length; r++) 
    {
        let value = Number(population_column.cells[r].value);
        
        if (!isNaN(value)) 
        {
            total += value;
        };
    };

    population_column.footer.value = total;  // Update footer
    return total;
}

// Calculate Cell Percentage from Population and Total
function calculate_cell_percentage() 
{
    let totalPopulation = Number(population_column.footer.value);
    
    // For Every Cell
    for (let r = 0; r < population_column.cells.length; r++) 
    {
        let cellValue = Number(population_column.cells[r].value);

        if (isNaN(cellValue) || cellValue == null) // If Cell Value is NaN
        {             
            percentage_column.cells[r].value = null;
        }
                
        else if (cellValue === 0)
        {
            percentage_column.cells[r].value = cellValue.toFixed(1);
        }
            
        else 
        {
            // Calculate Percentage
            let percentage = Number(((cellValue / totalPopulation) * 100).toFixed(1));

            // If Percentage is Valid Number
            if (!isNaN(percentage)) 
            {
                percentage_column.cells[r].value = percentage.toFixed(1);
            } 
                
            else 
            {
                percentage_column.cells[r].value = null;  // NaN case
            };
        };
    };   
};

// Function to Calculate Total Percentage
function calculate_total_percentage() 
{
    var total = 0;

    // For Every Population Cell
    for (let r = 0; r < percentage_column.cells.length; r++) 
    {
        let value = Number( percentage_column.cells[r].value);
        
        if (!isNaN(value)) 
        {
            total += value;
        };
    };

    percentage_column.footer.value = (Math.round(total * 10) / 10).toFixed(1);  // Update footer
};

// Function to Calculate Cumulative Percentage
function calculate_cell_cumulative()
{
    // For Every Cell in Cumulative Column
    for (let r = 0; r < percentage_column.cells.length; r++) 
    {
        let cellValue = Number(percentage_column.cells[r].value);
            
        if (isNaN(cellValue) || cellValue == null) // If Cell Value is NaN
        {             
            cumulative_column.cells[r].value = null;
        }
            
        else if (cellValue === 0)
        {
            cumulative_column.cells[r].value = cellValue.toFixed(1);
        }

        else
        {
            let cumulativePercentage = 0;

            for (let l = 0; l <= r; l++) // Add Every Previous Values
            {
                cumulativePercentage += Number(percentage_column.cells[l].value);
            };

            cumulative_column.cells[r].value = cumulativePercentage.toFixed(1);
        };         
    };
};

// Calculates the Descriptive Statistics and Graph Values
function calculate_descriptive_statistics(event)
{
    event.preventDefault()

    store_cell_values_array()

    // Update Descriptive Statistics Values
    calculate_mode();
    calculate_quartile();
    calculate_average();
    calculate_deviation();

    // Update Descriptive Statistics Display
    for(let m = 0; m <= mode.length - 1; m++)
    {
        // Single Mode Function
        if(m == 0)
        {
            mode_string = mode[m]
        }

        // Multiple Modal Function
        else
        {
            mode_string += " | " + mode[m]
        }

        mode_value.textContent = mode_string
    }

    min_value.textContent = min // Q1                    Q2                    Q3
    quartiles_value.textContent = quartile[0] + " | " + quartile[1] + " | " + quartile[2]
    max_value.textContent = max
    average_value.textContent = average
    deviation_value.textContent = deviation

    //Graph Values
    var graph = document.getElementById("graph");
    var pie = document.getElementById("pie");

    Plotly.react(graph, [], {});
    Plotly.react(pie, [], {});
    plot_graph(variables_values, percentage_values, variable_type);

    // Moves View Field to Graph
    get_started(graph, event)
}

// Stores Cell Values in Array for Easy Access
function store_cell_values_array()
{
    row_amount = Array.from(document.getElementById("table").rows).length; // Number of Rows in Table
    rows = Array.from(document.getElementById("table").rows); // Reference to the Rows in the Table

    // Columns
    variables_values = [];
    population_values = [];
    percentage_values = [];
    cumulative_values = [];

    variable_type = "discrete"; // Is Set to Discrete Until it Becomes Categorical or Continuous
    is_discrete = false;

    for (let r = 2; r <= row_amount - 1; r++) // Loop Through Rows
    {        
        var row = rows[r - 1];

        if (row) // Check if the Row Exists
        { 
            // Variable Column
            if (row.cells[0])
            {
                let cell = row.cells[0].querySelector("input");

                variables_values.push(cell.value); 
                
                // Stops Searching for Variable Type Once is Categorical
                if (variable_type != "categorical")
                {
                    find_variable_type(cell.value); // Find the Type of Variable
                };
            };

            // Population Column
            if (row.cells[1])
            {
                let cell = row.cells[1].querySelector("input");   
                
                population_values.push(cell.value);
            };

            // Percentage Column
            if (row.cells[2])
            {
                let cell = row.cells[2].querySelector("input");   
                    
                percentage_values.push(cell.value);
            };

            // Cumulative Column
            if (row.cells[3])
            {
                let cell = row.cells[3].querySelector("input");   
                    
                cumulative_values.push(cell.value);
            };
        };        
    };
};

// Finds the Variable Type
function find_variable_type(variable_value)
{
    // If Type is Continuous and Cell Below is a Number
    if (!isNaN(variable_value) && variable_type == "continuous")
    {
        variable_type = "categorical";
    }

    else if (isNaN(variable_value))
    {
        variable_value = String(variable_value).replaceAll(" ", "");

        // Continuous Syntax is [x, y[
        if (variable_value[0] == "[" && variable_value[variable_value.length - 1] == "[")
        {
            if (is_discrete)
            {
                variable_type = "categorical";
                return;
            };

            // Remove the First Bracket
            variable_value = variable_value.slice(1);
            let comma_index = variable_value.indexOf(",");

            // Get Category Bounds
            lower_bound = Number(variable_value.slice(0, comma_index));
            upper_bound = Number(variable_value.slice(comma_index + 1, -1));

            if (!isNaN(lower_bound) && !isNaN(upper_bound))
            {
                variable_type = "continuous";
            };
        }

        else
        {
            variable_type = "categorical";
        };
    }

    // If Cell is a Number
    else
    {
        is_discrete = true;
    };
};

// Calculate Mode Values of the Table
function calculate_mode()
{
    // Continuous Variable
    if (variable_type == "continuous")
    {
        mode = []; // All the Modal Values
        let mode_index = []; // Index for Every Mode
        let mode_variable = []; // Variable for Every Mode
        let largest_population = 0;

        // Find the Mode Index and Population Value
        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            // Compare to the Largest Value to Date
            if (Number(population_values[i]) > largest_population)
            {
                largest_population = Number(population_values[i]);

                // Resets the Mode Values when you Find a New Mode
                mode_index = [];
                mode = [];
                mode_variable = [];

                mode_index.push(i);
                mode.push(largest_population);
                mode_variable.push(variables_values[i]);
            }

            // Bi, Trimodal or More function
            else if (population_values[i] == largest_population)
            {
                // Doesn't Reset Mode Values if Value is Equal to Mode
                mode_index.push(i);
                mode.push(largest_population);
                mode_variable.push(variables_values[i]);
            };
        }; 
        
        // For Every Mode Value Find the Variable Value Linked to it
        for (let m = 0; m < mode.length; m++)
        {   
            mode_variable[m] = mode_variable[m].slice(1);
            let comma_index = mode_variable[m].indexOf(",");

            // Get Category Bounds
            lower_bound = Number(mode_variable[m].slice(0, comma_index));
            upper_bound = Number(mode_variable[m].slice(comma_index + 1, -1));

            // Mode Formula Variables
            let h = upper_bound - lower_bound;            
            let ƒm = mode[m];
            let ƒm1 = mode_index[m] > 0 ? population_values[mode_index[m] - 1] : 0;
            let ƒm2 = mode_index[m] < population_values.length - 1 ? population_values[mode_index[m] + 1] : 0;

            // Add to Mode Array
            mode[m] = isNaN((lower_bound + (( (ƒm - ƒm1) / ( (ƒm - ƒm1) + (ƒm - ƒm2) )) * h)).toFixed(1)) ? (lower_bound + (0.5 * h)).toFixed(1) : (lower_bound + (( (ƒm - ƒm1) / ( (ƒm - ƒm1) + (ƒm - ƒm2) )) * h)).toFixed(1);
            mode[m] = !isNaN(Number(mode[m])) ? String(mode[m]) : "none";
        };
    }

    // Discrete or Categorical Variable
    else
    {
        let largest_population = 0;

        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            // Compare to the Largest Value to Date
            if (Number(population_values[i]) > largest_population || population_values[i] == 0)
            {
                largest_population = Number(population_values[i]);

                mode = [];                
                mode.push(String(variables_values[i]));
            }

            // Bi or Trimodal function
            else if (population_values[i] == largest_population)
            {
                mode.push(String(variables_values[i]));
            };     
        };
    };
};

// Calculate Quartile Value of the Table
function calculate_quartile()
{
    let quartile_variable; // Quartile Variable
    let quartiles_variable_N = [percentage_column.footer.value / 4, percentage_column.footer.value / 2, (percentage_column.footer.value / 4) * 3] // Percentage to Break
    let quartile_index = 0; // Quartile Position in Table

    // Continuous Variable
    if (variable_type == "continuous")
    {
        for (let q = 0; q < 3; q++)
        {
            for(let i = 0; i <= cumulative_values.length - 1; i++)
            {
                // When Cumulative % Breaks __%
                if (cumulative_values[i] >= quartiles_variable_N[q])
                {
                    quartile_index = i;
                    quartile_variable = variables_values[quartile_index];
                    break;
                };
            };

            // Remove First Bracket of Variable
            quartile_variable = quartile_variable.slice(1);
            let comma_index = quartile_variable.indexOf(",");

            // Get Category Bounds
            lower_bound = Number(quartile_variable.slice(0, comma_index));
            upper_bound = Number(quartile_variable.slice(comma_index + 1, -1));

            // Quartile Formula Variables
            let h = upper_bound - lower_bound; // Width of Class
            let N = quartiles_variable_N[q] // Total Frequency of Classe
            let ƒ = percentage_values[quartile_index]; // Frequency of Current Class
            let F = !isNaN(cumulative_values[quartile_index - 1]) ? cumulative_values[quartile_index - 1] : 0; // All Frequency Before Curent Class

            // Set Quartile if Valid Value
            quartile[q] = (lower_bound + (((N - F) / ƒ) * h)).toFixed(1);
            quartile[q] = !isNaN(quartile[q]) ? String(quartile[q]) : "none";
        };

        // Minimum and Maximum
        let min_variable = variables_values[0].slice(1); // First Variable
        let max_variable = variables_values[cumulative_values.length - 1].slice(1); // Last Variable

        let min_comma_index = min_variable.indexOf(",");
        let max_comma_index = max_variable.indexOf(",");

        min = Number(min_variable.slice(0, min_comma_index));
        max = Number(max_variable.slice(max_comma_index + 1, -1));
    }

    //Discrete or Categorical Variable
    else
    {
        for (let q = 0; q < 3; q++)
        {
            for(let i = 0; i <= cumulative_values.length - 1; i++)
            {
                // When Cumulative % Breaks 50%
                if (cumulative_values[i] >= quartiles_variable_N[q])
                {
                    quartile_index = i;
                    quartile_variable = variables_values[quartile_index];
                    break;
                };
            };

            quartile[q] = String(quartile_variable);
        };

        // Minimum and Maximum
        min = variables_values[0];
        max = variables_values[cumulative_values.length - 1];
    };
};

// Calculate Average Value of the Table
function calculate_average()
{
    // Continuous Variable
    if (variable_type == "continuous")
    {
        average = 0;
    
        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            // Remove First Bracket
            let average_variable = variables_values[i];
                average_variable = average_variable.slice(1);
            let comma_index = average_variable.indexOf(",");
    
            // Get Category Bounds
            lower_bound = Number(average_variable.slice(0, comma_index));
            upper_bound = Number(average_variable.slice(comma_index + 1, -1));
            
            // Variable for Formula
            let h = (lower_bound + upper_bound) / 2;

            average += (h * population_values[i]);
        };

        // Calculate and Assign Average if Viable Value
        average = (average / population_column.footer.value).toFixed(1);
        average = !isNaN(average) ? String(average) : "none";
    }

    // Discrete Variable
    else if (variable_type == "discrete")
    {
        average = 0;
    
        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            average += variables_values[i] * population_values[i];
        };
    
        average = String((average / population_column.footer.value).toFixed(1));
    }

    // Categorical Variable
    else
    {
        average = "none";
    };
};

// Calculate Deviation Value of the Table
function calculate_deviation()
{
    // Continuous Variable
    if (variable_type == "continuous")
    {
        deviation = 0;

        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            // Remove First Bracket
            let deviation_variable = variables_values[i];
                deviation_variable = deviation_variable.slice(1);
            let comma_index = deviation_variable.indexOf(",");
    
            // Get Category Bounds
            lower_bound = Number(deviation_variable.slice(0, comma_index));
            upper_bound = Number(deviation_variable.slice(comma_index + 1, -1));
            
            // Variable for Formula
            let x = (lower_bound + upper_bound) / 2;

            deviation += (((x - average) ** 2) * population_values[i]);
        };

        deviation = (Math.sqrt(deviation / population_column.footer.value)).toFixed(1);
    }

    // Discrete Variable
    else if (variable_type == "discrete")
    {
        deviation = 0;

        for(let i = 0; i <= variables_values.length - 1; i++)
            {                
                let x = variables_values[i];
    
                deviation += (((x - average) ** 2) * population_values[i]);
            };
    
        deviation = (Math.sqrt(deviation / population_column.footer.value)).toFixed(1);
    }

    // Categorical Variable
    else
    {
        deviation = "none";
    };
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Checks for Changes in Cells
function add_event_listener_to_cell() 
{
    table.addEventListener("input", (e) => 
    {
        if (e.target && e.target.matches("input")) 
        {
            on_cell_update(e.target);
        };
    });

    // Selects the Whole Cell Content on Click
    document.querySelectorAll("#variable_cell").forEach(input => { input.addEventListener("click", () => { input.select() }) });
    document.querySelectorAll("#population_cell").forEach(input => { input.addEventListener("click", () => { input.select() }) });
}

// Function that Gets Called when Cells Update
function on_cell_update(cell)
{    
    refresh_table();
};

// Function Called by to Move Viex to an Element
function get_started(element, event)
{
    event.preventDefault();
    event.target.blur();

    // Scroll to Element
    element.scrollIntoView({behavior: "smooth", block: "center"});
};

// Function to Plot Graphs with Values
function plot_graph(x_data, y_data, graph_type)
{
    var Graph = document.getElementById("graph");
    var Pie = document.getElementById("pie");

    //Histogram
    if (graph_type == "continuous")
    {
        let x = [];
        let lB = [];
        let uB = [];
        let width = [];

        for(let i = 0; i <= variables_values.length - 1; i++)
        {
            // Remove First Bracket
            let average_variable = variables_values[i];
                average_variable = average_variable.slice(1);
            let comma_index = average_variable.indexOf(",");

            // Get Category Bounds
            lower_bound = Number(average_variable.slice(0, comma_index));
            upper_bound = Number(average_variable.slice(comma_index + 1, -1));
            
            // Variable for Formula
            let h = (lower_bound + upper_bound) / 2;

            x.push(h);
            lB.push(lower_bound);
            uB.push(upper_bound);
            width.push(upper_bound - lower_bound)
        };

        // Histogram Data
        var data = 
        [{
            x: x,
            y: y_data,
            text: x_data,
            width: width,

            hoverinfo: "y+text",

            type: "bar",

            marker: 
            {
                color: "rgb(5, 40, 60)"
            }
        }]; 

        // Histogram Layout
        var layout = 
        {
            xaxis: 
            {             
                title: variables_column.header.value,
                font: {
                    family: "LeagueSpartan",
                    size: 24,
                    weight: "bold"                
                },
            },

            yaxis: 
            { 
                title: population_column.header.value + " (%)",
                font: {
                    family: "LeagueSpartan",
                    size: 24,
                    weight: "bold"                
                }
            },

            dragmode: "pan",
            hovermode: "closest"
        };

        // Histogram Configuration
        var config = 
        {
            displayModeBar: true,
            displaylogo: false,
            responsive: true,
            modeBarButtonsToRemove: ['toImage', "zoom2d", "select2d", "lasso2d", "autoScale2d", "toggleSpikelines", "pan2d", "toggleHover"],
        };
    }

    // Bar Chart
    else if (graph_type == "discrete" || graph_type == "categorical")
    {
        // Bar Data
        var data = 
        [{
            x: x_data,
            y: y_data,
            type: "bar",
            width: 0.5,
            marker: 
            {
                color: "rgb(5, 40, 60)"
            }
        }]; 

        // Bar Layout
        var layout = 
        {
            xaxis: 
            {             
                title: variables_column.header.value,
                font: {
                    family: "LeagueSpartan",
                    size: 24,
                    weight: "bold"                
                },
            },

            yaxis: 
            { 
                title: population_column.header.value + " (%)",
                font: {
                    family: "LeagueSpartan",
                    size: 24,
                    weight: "bold"                
                }
            },

            dragmode: "pan",
            hovermode: "closest"
        };

        // Bar Config
        var config = 
        {
            displayModeBar: true,
            margin: { t: 0 },
            displaylogo: false,
            responsive: true,
            modeBarButtonsToRemove: ['toImage', "zoom2d", "select2d", "lasso2d", "autoScale2d", "toggleSpikelines", "pan2d", "toggleHover"],
        };
    };

    // Plot with Graph Data, Layout and Configuration
    Plotly.plot(Graph, data, layout, config);

    /****************************************************************************************************************************************************************/

    // If Table is Empty Print Temporary Pie
    if(population_values[0] == "")
    {
        // Pie Data
        var pie_data = 
        [{
            values: [1],
            labels: [""],
            textinfo: "percent",
            hoverinfo: 'label',
            type: "pie",
            marker: 
            {
                colors: ["rgb(5, 40, 60)"]
            },
        }]; 
    }

    // If Table Isn't Empty
    else
    {
        // Pie Data
        var pie_data = 
        [{
            values: population_values,
            labels: x_data,
            textinfo: "percent",
            hoverinfo: 'label',
            type: "pie",
            marker: 
            {
                colors: x_data
            },
        }]; 
    };

    // Pie Layout
    var pie_layout = 
    {

    };

    // Pie Configuration
    var pie_config = 
    {
        displayModeBar: false,
    };

    // Plot Pie with Data, Layout and Configuration
    Plotly.plot(Pie, pie_data, pie_layout, pie_config);
}
