//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;
var speciesList = ["None"];
var stoichMatrix = [];
var icList = [];
var currentConcList = [];
var propList = [];
var rxnCount;
var formalPropList = [];
var xScale, yScale, xScale_exp, yScale_exp;

//$.ajax({
//   url: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js",
//  dataType: "script"
// });




for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}


$("#add-species").click(function () {
    $(".speciestable").each(function () {
        var tds = '<tr>';
        var emptyCell = '<td><input type="text" class="species"></td>';
        var icCell = '<td><input type="number" class="species_ic" value="0"></td>';
        tds += emptyCell;
        tds += icCell;
        tds += '<td><button class="rm-species">Delete</button></td>'
        tds += '</tr>';
        if ($('tbody', this).length > 0) {
            $('tbody', this).append(tds);
        } else {
            $(this).append(tds);
        }
    });
});


$("#confirm-species").click(function() {
    //update species list
    updateSpecies();
});


function updateSpecies() {
    //update species list
    speciesList = ["None"];
    $(".speciestable tbody tr td input.species").each(function () {
        var speciesName = $(this).val();
        speciesList.push(speciesName);
        
        $(this).attr("value", speciesName);
    });

    //update rxn table dropdowns
    $(".rxntable tr td select").each(function () {
        // get selected value, then empty the dropdown to repopulate it
        var selectedVal = $(this).find(":selected").val();
        var newOption;
        $(this).empty();
        // repopulate dropdown and set back to original selected value
        speciesList.forEach(species => {
            if (species == selectedVal) {
                newOption = '<option value="'+species+'" selected>'+species+'</option>';
            } else {
                newOption = '<option value="'+species+'">'+species+'</option>';
            }
            
            $(this).append(newOption);
        });
    })

}

// delete a row of the species table to remove a species
$(".speciestable").on('click', '.rm-species', function () {
    $(this).closest('tr').remove();
});


// add one reactant to a reaction in the rxn table
$(".add-reactant").click(function () {
    var newDropdown = '<td>+</td><td><select class="reactant-select"></select></td>';
    $(this).parent().last().before(newDropdown);
    updateSpecies();
});


// add one product to a reaction in the rxn table
$(".add-product").click(function () {
    var newDropdown = '<td>+</td><td><select class="product-select"></select></td>';
    $(this).parent().last().before(newDropdown);
    updateSpecies();
});


// add reaction
// create a new table row with:
// delete button
// rxn number
// reactant & product dropdowns
// add reactant & product buttons
$("#add-rxn").click(function() {
    // find out how many rxns already exist
    var rxnNum = parseInt($(".rxntable tr td.rxnnum").last().html())+1;

    //var newRow = '<tr><td><select class="reactant-select"></select></td><td><button class="add-reactant">+</button></td><td>&#x2192</td><td><select class="product-select"></select></td><td><button class="add-product">+</button></td></tr>';
    //broken up below for readability
    var newRow = '<tr>';
    newRow +='<td class="rxndelete"><button>Delete</button></td>'; // rxn delete button
    newRow +='<td class="rxnnum" id="rxnnum'+rxnNum+'">'+rxnNum+'. </td>'; // rxn number
    newRow += '<td><select class="reactant-select"></select></td>'; // first reactant selector
    newRow +='<td><button class="add-reactant">+</button></td>'; // add reactant button 
    newRow +='<td>&#x2192</td>'; // arrow
    newRow +='<td><select class="product-select"></select></td>'; // product selector
    newRow +='<td><button class="add-product">+</button></td>'; // add product button
    newRow += '</tr>';
    $(".rxntable tbody").append(newRow);
    updateSpecies();
});



$(".rxntable").on('click', '.rxndelete', function () {
    $(this).closest('tr').remove();
});



// confirm reactions
$("#confirm-rxn").click(function () {

    // first, check species and remove all spurious reactions
    updateSpecies();
    checkReactions();

    // get total number of reactions
    var numRxns = parseInt($(".rxntable tr td.rxnnum").last().html());

    // Update parameters section
    // for each reaction, add a row with relevant rate constant
    for(rxn = 1; rxn <= numRxns; rxn++) {
        var k = "k_"+rxn;
        var prev_val = 0;
        if($(".param-input-field[name="+k+"]").length > 0) {
            //prev_val = $("param-input-field[name="+k+"]").val();
            continue;
        }

        var input = '<div class="param-input">'; // create input div
        input += '<label for="'+k+'">'+k+':</label>'; // add label
        input += '<input type="number" name="'+k+'" class="param-input-field" value = "'+prev_val+'">'; // add input
        input += ''; //close div


        // add new row to parameter inputs
        $("#const-inputs.param-input-container").append(input);

    }


    // Also update stoichiometry matrix & display it
    updateStoichMatrix();
    var newDisplay = getStoichMatrixDisplay();
    $("#stoichDisplay").empty();
    $("#stoichDisplay").append(newDisplay);

    // load MathJax again for it to process the update
    MathJax.typeset();
});


function checkReactions() {
    // iterate over each reaction
    $(".rxntable tr").each( function() {
        // get rxn number
        var rxnNum = parseInt($(this).find("td.rxnnum").html());

        // check if all reactants/products are none, if so delete from rxn table & move on
        //var reactants = [];
        var rAllNone = true;
        $(this).find("td select.reactant-select").find(":selected").each(function() {
            if($(this).val() != "None") {
                rAllNone = false;
            }
            //reactants.push($(this).val());
        });

        //var prods = [];
        var pAllNone = true;
        $(this).find("td select.product-select").find(":selected").each(function () {
            //prods.push($(this).val());
            if($(this).val() != "None") {
                pAllNone = false;
            }
        });

        if(rAllNone && pAllNone) {
            $(this).remove();
        }

    });
}




// load parameters into the model, update display
$("#params-load").click(function () {
    // update species just in case
    updateSpecies();
    // update stoichiometry matrix
    updateStoichMatrix();
    // update initial state display
    displayIC();
    // update propensity matrix
    updatePropList();
    displayPropMatrix();
    // create/reset rxn_log, and run one step
    setupRxnLog();
    //simStep();
});

function displayIC() {
    var icMatrix = '<h5>Initial State X</h5> \n$$\\begin{bmatrix}\n';
    icList = [];
    speciesList.forEach(species => {
        if(species != "None") {
            var speciesIC = $(".species[value="+species+"]").parent().parent().find(".species_ic").val();
            icMatrix += '\\text{'+species+'} = '+speciesIC+' \\\\\n';
            icList.push(parseFloat(speciesIC));
        }
    });
    currentConcList = [...icList];
    icMatrix += '\\end{bmatrix}$$';
    $("#icDisplay").empty();
    $("#icDisplay").append(icMatrix);

    // load MathJax again for it to process the update
    MathJax.typeset();



}


// get formal & actual propensity function for one reaction
function getRxnPropensity(rxnNum) {
    // allocate output vars
    var formalProp = 'k_'+rxnNum;
    
    var k = $(".param-input-field[name="+formalProp+"]").val();
    var actualProp = parseFloat(k);
    formalProp += '*';
    
    // get reactants for the rxn
    console.log("rxnnum: "+rxnNum)
    var reactants = [];
    query='.rxntable tr td#rxnnum'+rxnNum;
    $(query).parent().find("select.reactant-select").find(":selected").each(function() {
        if($(this).val() != "None") {
            reactants.push($(this).val());
            console.log("adding reactant: "+$(this).val())
        }  
    });
    

    // cat together formal propensity, while computing actual
    reactants.forEach(rct => {
        // get reactant index in species list
        var rctNum = speciesList.findIndex(function(x) {
            return x == rct;
        })-1;
        formalProp += 'X['+rctNum+']';

        // get reactant concentration
        var rctCon = parseFloat(currentConcList[rctNum]);
        actualProp *= rctCon;
    });


    return [formalProp, actualProp];
    
}


function updateStoichMatrix() {
    // iterate over each reaction
    $(".rxntable tr").each( function() {
        var arrSize = speciesList.length-1
        var inputs = new Array(arrSize); for (let i=0; i<arrSize; ++i) inputs[i] = 0;
        var outputs = new Array(arrSize); for (let i=0; i<arrSize; ++i) outputs[i] = 0;

        // update inputs vector: loop over reactants
        $(this).find("td select.reactant-select").find(":selected").each(function() {
            if($(this).val() != "None") {
                var species = $(this).val();
                var rctNum = speciesList.findIndex(function(x) {
                    return x==species;
                })-1;
                inputs[rctNum] += 1;
            }  
        });

        // update outputs vector
        $(this).find("td select.product-select").find(":selected").each(function() {
            if($(this).val() != "None") {
                var species = $(this).val();
                var rctNum = speciesList.findIndex(function(x) {
                    return x == species;
                })-1;
                outputs[rctNum] += 1;
            }  
        });

        // reaction vector is outputs - inputs
        var rxnVector = outputs.map((n, i) => n - inputs[i]);
        
        // update reaction vector in global stoich matrix
        var rxnNum = parseInt($(this).find("td.rxnnum").html());
        stoichMatrix[rxnNum-1] = rxnVector;

    });
}


function getStoichMatrixDisplay() {
    var disp = '<h5>Stoichiometry</h5> \n$$\\begin{bmatrix}\n';;
    var stoichMat_t = transpose(stoichMatrix);
    stoichMat_t.forEach(rxn => {
        rxn.forEach(cell => {
            disp += ' '+cell+' & ';
        })
        disp += ' \\\\\n';
    });
    disp += '\\end{bmatrix}$$';
    return disp;
}

// helper function from https://stackoverflow.com/a/46805290
function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}



function updatePropList() {
    formalPropList = [];
    propList = [];
    // iterate over each reaction
    $(".rxntable tr").each( function() {
        // get rxn number
        var rxnNum = parseInt($(this).find("td.rxnnum").html());
        var rxnProps = getRxnPropensity(rxnNum);

        formalPropList.push(rxnProps[0]);
        propList.push(rxnProps[1]);

        
    });

}

function getPropMatrixDisplay() {
    
    // allocate output
    var out = '';
    out += '<h5>Propensities</h5>'; // section header
    out += '<table id="propensity-table"><tr><th>Formal</th><th>Actual</th></tr>'; // open table, headers

    // iterate over each reaction
    $(".rxntable tr").each( function() {
        // get rxn number
        var rxnNum = parseInt($(this).find("td.rxnnum").html());
        //var rxnProps = getRxnPropensity(rxnNum);
        var rxnProps = propList[rxnNum-1].toFixed(2);
        var rxnFormalProp = formalPropList[rxnNum-1];
        out += '<tr><td>' + rxnFormalProp + '</td>'; // open row, add formal propensity
        out += '<td>' + rxnProps + '</td></tr>'; // add actual propensity, close row

    });
    out += '</table>'; // close table
    return out;

}


function displayPropMatrix() {
    out = getPropMatrixDisplay();
    $("#propensity-display").empty();
    $("#propensity-display").append(out);
}


// on step: update all displays for one reaction
$("#sim-step").click(function() {
    simStep();
})


function simStep() {

    // obtain reaction time interval
    
    // generate a random number
    var rand = Math.random();
    var sum = propList.reduce((partialSum, a) => parseFloat(partialSum) + parseFloat(a), 0);
    var tau = -1*Math.log((1-rand)) / sum;

    // update waiting time plot display
    displayWaitingUnif(rand);
    displayWaitingExp(rand, tau);

    // select a reaction
    rand = Math.random();
    var randRxn = rand*sum;

    var rxn = 0;
    var cumsum = 0;
    for(let prop of propList) {
        cumsum += parseFloat(prop);
        if(cumsum >= randRxn) {
            break;
        }
        rxn += 1;
    }; 

    // update selected reaction display

    // compute new system state
    var rxnVector = stoichMatrix[rxn];
    currentConcList = [...currentConcList.map((n, i) => parseFloat(n) + parseFloat(rxnVector[i]))];


    // update system state display
    updatePrevStateDisplay();

    // update propensity display
    updatePropList();
    
    displayPropMatrix();

}


function updatePrevStateDisplay() {
    var outMatrix = '<h5>Initial State X</h5> \n$$\\begin{bmatrix}\n';
    speciesList.forEach((species, i) => {
        if(species != "None") {
            var speciesConc = currentConcList[i-1];
            outMatrix += speciesConc+' \\\\\n';
        }
    });
    outMatrix += '\\end{bmatrix}$$';
    $("#prevStateDisplay").empty();
    $("#prevStateDisplay").append(outMatrix);

    // load MathJax again for it to process the update
    MathJax.typeset();

}


function getRxnInterval() {
    //pyodide.globals.speciesList = speciesList;
    //pyodide.globals.propList = propList;
    //console.log(pyodide.runPython(`
    //    print propList
    //`));

    // generate a random number
    //var rand = Math.random();
    var sum = propList.reduce((partialSum, a) => parseFloat(partialSum) + parseFloat(a), 0);
    var tau = -1*Math.log(rand) / Math.sum;
    return(tau);
}



function setupRxnLog() {
    var h1 = ['t_prev','t_new','last_rxn','unif_samp','rxn_samp'];
    h2 = h1.concat(speciesList.map((n) => n + '_conc')); // add species concentrations
    // get total number of reactions
    var numRxns = parseInt($(".rxntable tr td.rxnnum").last().html());
    // add a header for each reaction constant
    var keys = [...Array(numRxns).keys()];
    h3 = h2.concat(keys.map((n) => 'k_'+(n+1)));

    // save csv to data folder
    // export_csv(h3, [], ",", "data/rxnlog");

}




// adapted from https://seegatesite.com/tutorial-read-and-write-csv-file-with-javascript/
const export_csv = (arrayHeader, arrayData, delimiter, fileName) => {
    let header = arrayHeader.join(delimiter) + '\n';
    let csv = header;
    arrayData.forEach( array => {
        csv += array.join(delimiter)+"\n";
    });

    let csvData = new Blob([csv], { type: 'text/csv' });  
    let csvUrl = URL.createObjectURL(csvData);

    let hiddenElement = document.createElement('a');
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + '.csv';
    hiddenElement.click();
}



// Waiting time graphic
// set up uniform distribution visual
function displayWaitingUnif(rand) {
    x2 = [rand, rand]; 
    y2 = [0, 2]

    dataset_unifsamp = []
    for (var j = 0; j < x2.length; j++) {
        dataset_unifsamp[j] = []
        dataset_unifsamp[j][0] = x2[j]
        dataset_unifsamp[j][1] = y2[j]
    }

    //var svg = d3.select('svg#waiting-unif-display');
    var svg = d3.select('#waiting-container').transition();
    var line = d3.line()
        .x(function(d) { return xScale(d[0]);})
        .y(function(d) { return yScale(d[1]);});
    
    svg.select("path.unifsamp")
    .attr("d",line(dataset_unifsamp))
    .attr("stroke", "red")
    .attr("fill","none")
    .attr("class", "unifsamp")


}


var x = d3.range(0, 1, 0.0025); 
var y = new Array(400); for (let i=0; i<400; ++i) y[i] = 1;

var dataset_unifdist = []
for (var j = 0; j < x.length; j++) {
    dataset_unifdist[j] = []
    dataset_unifdist[j][0] = x[j]
    dataset_unifdist[j][1] = y[j]
}


var x2 = [0, 0]; 
var y2 = [0, 2]

var dataset_unifsamp = []
for (var j = 0; j < x2.length; j++) {
    dataset_unifsamp[j] = []
    dataset_unifsamp[j][0] = x2[j]
    dataset_unifsamp[j][1] = y2[j]
}


function drawWaitingUnifDisplay() {
    var w = 250
    var h = 250
    var padding = 25

    xScale = d3.scaleLinear()
                    .domain([d3.min(x, function(d) { return d }), d3.max(x, function(d) { return d })])
                    .range([padding, w - padding * 2])

    yScale = d3.scaleLinear()
                .domain([0, 3])
                .range([h - padding, padding])

    function mycanvas() {
        var svg = d3.select('svg#waiting-unif-display')
                .attr('width', w)
                .attr('height', h)
        svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'lightgrey')
        // Define the axis
        var xAxis = d3.axisBottom().scale(xScale).ticks(9)
        var yAxis = d3.axisLeft().scale(yScale).ticks(9)
        // Create the axis
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (h - padding) + ')')
            .call(xAxis)
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + padding + ',0)')
            .call(yAxis)

        var line = d3.line()
                    .x(function(d) { return xScale(d[0]);})
                    .y(function(d) { return yScale(d[1]);});
                    
        svg.append("path")
        .attr("d", line(dataset_unifdist))
        .attr("stroke", "white")
        .attr("fill", "none")
        .attr("class", "unifdist")
        svg.append("path")
            .attr("d",line(dataset_unifsamp))
            .attr("stroke", "red")
            .attr("fill","none")
            .attr("class", "unifsamp")
    }

    mycanvas();
}






// Generate data from an exponential distribution with parameter sum(propList)
// For the exponential distribution use 4x variance to set the x domain. Variance is 1/lambda
var lambda = 0.5//d3.sum(propList);
var x_exp = d3.range(0, (4/lambda), (4/lambda/200)); 
var y_exp = new Array(200); for (let i=0; i<200; ++i) y_exp[i] = 1-Math.exp(-1*lambda*x_exp[i]);

var dataset_expdist = []
dataset_expdist= transpose([x_exp,y_exp])


// Next, generate a horizontal line at y = rand
var x2_exp = [0, (4/lambda)]; 
var y2_exp = [0, 0]

var dataset_expsamp = []
dataset_expsamp= transpose([x2_exp,y2_exp])


// Finally, generate a vertical line at x = tau
var x2_tau = [0, 0]; 
var y2_tau = [0, 2]

var dataset_tausamp = []
dataset_tausamp= transpose([x2_tau,y2_tau])




function drawWaitingExpDisplay() {
    var w = 250
    var h = 250
    var padding = 25

    xScale_exp = d3.scaleLinear()
                    .domain([d3.min(x_exp, function(d) { return d }), d3.max(x_exp, function(d) { return d })])
                    .range([padding, w - padding * 2])

    yScale_exp = d3.scaleLinear()
                .domain([0, 1])
                .range([h - padding, padding])

    function mycanvas() {
        var svg = d3.select('svg#waiting-exp-display')
                .attr('width', w)
                .attr('height', h)
        svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'lightgrey')

        // Define the axis
        var xAxis = d3.axisBottom().scale(xScale_exp).ticks(9)
        var yAxis = d3.axisLeft().scale(yScale_exp).ticks(9)
        // Create the axis
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (h - padding) + ')')
            .call(xAxis)
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + padding + ',0)')
            .call(yAxis)

        var line = d3.line()
                    .x(function(d) { return xScale_exp(d[0]);})
                    .y(function(d) { return yScale_exp(d[1]);});
                  
        // Add a line for the exponential distribution
        svg.append("path")
        .attr("d", line(dataset_expdist))
        .attr("stroke", "white")
        .attr("fill", "none")
        .attr("class", "expdist")
        // Add the horizontal line
        svg.append("path")
            .attr("d",line(dataset_expsamp))
            .attr("stroke", "red")
            .attr("fill","none")
            .attr("class", "expsamp")
        // Add the vertical line
        svg.append("path")
            .attr("d",line(dataset_tausamp))
            .attr("stroke", "blue")
            .attr("fill","none")
            .attr("class", "tausamp")

    }

    mycanvas();
}






// Exponential cdf
function expCDF(lambda, x) {
    return(1 - Math.exp(-1*lambda*x))
}

// Waiting time graphic
// set up uniform distribution visual
function displayWaitingExp(rand, tau) {



    // Generate data from an exponential distribution with parameter sum(propList)
    // For the exponential distribution use 4x variance to set the x domain. Variance is 1/lambda
    lambda = d3.sum(propList);
    x_exp = d3.range(0, (4/lambda), (4/lambda/200)); 
    y_exp = new Array(200); for (let i=0; i<200; ++i) y_exp[i] = 1-Math.exp(-1*lambda*x_exp[i]);

    dataset_expdist = []
    dataset_expdist= transpose([x_exp,y_exp])


    // Next, generate a horizontal line at y = rand
    x2_exp = [0, tau]; 
    y2_exp = [rand, rand]

    dataset_expsamp = []
    dataset_expsamp= transpose([x2_exp,y2_exp])


    // Finally, generate a vertical line at x = tau
    x2_tau = [tau, tau]; 
    y2_tau = [0, rand]

    dataset_tausamp = []
    dataset_tausamp= transpose([x2_tau,y2_tau])

    var w = 250
    var h = 250
    var padding = 25

    xScale_exp = d3.scaleLinear()
                    .domain([d3.min(x_exp, function(d) { return d }), d3.max(x_exp, function(d) { return d })])
                    .range([padding, w - padding * 2])

    yScale_exp = d3.scaleLinear()
                .domain([0, 1])
                .range([h - padding, padding])


    //var svg = d3.select('svg#waiting-unif-display');
    var svg = d3.select('#waiting-exp-container').transition();
    var line = d3.line()
        .x(function(d) { return xScale_exp(d[0]);})
        .y(function(d) { return yScale_exp(d[1]);});
    
    svg.select("path.expsamp")
    .attr("d",line(dataset_expsamp))
    .attr("stroke", "red")
    .attr("fill","none")
    .attr("class", "expsamp")
    svg.select("path.tausamp")
    .attr("d",line(dataset_tausamp))
    .attr("stroke", "blue")
    .attr("fill","none")
    .attr("class", "tausamp")

        


}



// initialize plots
drawWaitingUnifDisplay();
drawWaitingExpDisplay();
