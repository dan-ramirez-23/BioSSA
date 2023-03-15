//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;
var speciesList = ["None"];
var stoichMatrix = [];
var icList = [];
// currentConcList is a 2-D array, dim-1: trajectory ID, dim-2: species conc
var currentConcList = [];
//trajectory is a 3D array, dim-1(size 1 by default): trajectory ID , dim-2: time, dim-3: species
//var trajectory = [];
// times is a 2D array, dim-1 trajectory ID, dim-2 time
var times = [];
// propList is a 2D array, dim-1 trajectory ID, dim-2 reactions
var propList = [];
propList[0] = [0.2, 0, 0, 0];
var rxnCount;
var formalPropList = [];
var xScale, yScale, xScale_exp, yScale_exp, xScale_rxnSelect, yScale_rxnSelect;
// currTime is an array, dim-1: trajectory ID
var currTime = [0];
var numTrajectories = 1;
var simTime;
var simRunning = false;

//$.ajax({
//   url: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js",
//  dataType: "script"
// });


// Tutorial on help button click
$("#help-button").click(function() {
    introJs().setOptions({
        steps: [{
          element: document.querySelector('.header'),
          title: 'Welcome',
          intro: 'Welcome to BioSSA! This is a platform for simulating chemical reaction networks in biology using the Stochastic Simulation, or Gillespie, Algorithm'
        },
        {
          element: document.querySelector('.dropdown-btn'),
          intro: 'For a quick intro to the Stochastic Simulation Algorithm and its uses in biology, check out these short articles'
        },
        {
          title: 'Step 1: Define Species',
          element: document.querySelector('#speciespanel'),
          intro: 'First, create names and initial concentrations for each type of molecule in your model. Click "Confirm Species" when you\'re ready to move on.'
        },
        {
          title: 'Step 2: Define Reactions',
          element: document.querySelector('#rxnpanel'),
          intro: 'Next, define all possible reactions. If a molecule catalyzes a reaction but is not consumed, include it as a reactant and a product. Click "Confirm Reactions" when you\'re ready to move on.'
        },
        {
            title: 'Step 3: Reaction Parameters',
            element: document.querySelector('#const-inputs'),
            intro: 'Each reaction needs a constant value describing its rate. A higher rate will mean the reaction is more likely to occur. You may also specify a total simulation time here (note, the number of reactions that occurs in this time will depend on the constants)'
        },
        {
            title: 'Step 4 (Optional): Ensemble Analysis',
            element: document.querySelector('#ensemble-inputs'),
            intro: 'By default, BioSSA will simulate one trajectory of your system. Check the box labeled "Multiple trajectories" to instead simulate several parallel instances of your model. The plots will then report average values across all trajectories.'
        },
        {
            title: 'Step 5: Load Parameters',
            element: document.querySelector('#params-load'),
            intro: 'Click Load to finalize all parameters - you should see a visual network model of your system show up in the top left.'
        },
        {
            title: 'Step 6: Run!',
            element: document.querySelector('.control-buttons-container'),
            intro: 'You can the run the simulation one step at a time and observe the results on the right side of the screen, or continuously to observe full trajectories below.'
        },
        {
            title: 'Results: Initial Conditions',
            element: document.querySelector('#icDisplay'),
            intro: 'Here, the initial conditions you set in Step 1 are used to compute initial propensities and start the simulation.'
        },
        {
            title: 'Results: Propensity Calculation',
            element: document.querySelector('#propensity-display'),
            intro: 'Formal propensities are based on the Law of Mass Action. Actual propensities are computed based on the concentration of each species in state vector X'
        },
        {
            title: 'Results: Waiting Time (Uniform Sample)',
            element: document.querySelector('#waiting-container'),
            intro: 'The waiting time until the next reaction starts from a random sample from a uniform distribution...'
        },
        {
            title: 'Results: Waiting Time',
            element: document.querySelector('#waiting-exp-container'),
            intro: '...which is transformed into a sample from an exponential distribution with parameter a, where a is the sum of actual propensities.'
        },
        {
            title: 'Results: Current Time',
            element: document.querySelector('#time-summary-container'),
            intro: 'The current simulation time is then incremented by the waiting time. Next, we will determine which reaction occurs at this time.'
        },
        {
            title: 'Results: Previous State',
            element: document.querySelector('#prevStateDisplay'),
            intro: 'The previous system state (i.e., concentrations of each species) is presented here for context.'
        },
        {
            title: 'Results: Stoichiometry Matrix',
            element: document.querySelector('#stoichDisplay'),
            intro: 'The stoichiometry matrix shows the net effects of each reaction on the system. Each column represents one reaction, and each row represents the change in concentration of that species when the reaction occurs.'
        },
        {
            title: 'Results: Next Reaction',
            element: document.querySelector('#rxn-select-container'),
            intro: 'We select a reaction based on a second random uniform sample on the interval [0,a] where a is the sum of actual propensities. Wherever the random sample falls, determines the reaction to occur. In this way, a reaction with a high rate or a high abundance of reactants will be more likely.'
        },
        {
            title: 'Results: Current State',
            element: document.querySelector('#curr-state-container'),
            intro: 'The column for the selected reaction is added to the previous state to generate the new system state.'
        },
        {
            title: 'Results: System Trajectories',
            element: document.querySelector('#traj-container'),
            intro: 'This line plot shows the evolution of the system over time. Click on any species in the legend to hide/show it.'
        },
        {
            title: 'Results: Ensemble Distributions',
            element: document.querySelector('#ensemble-container'),
            intro: 'For ensemble simulations, this heatmap shows the distribution of states along any two species. Use the dropdowns to select which species is plotted on which axis.'
        },
        {
            title: 'Explore!',
            intro: 'Feel free to modify the existing systems or create your own and explore!'
        },
        ]
      }).start();
});



// Set up sidebar dropdowns
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
    updateIC();
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

// update initial conditions. later, when parameters are load
function updateIC() {
    icList = [];
    speciesList.forEach(species => {
        if(species != "None") {
            var speciesIC = $(".species[value="+species+"]").parent().parent().find(".species_ic").val();
            icList.push(parseFloat(speciesIC));
        }
    });
    for(let i = 0; i < numTrajectories; i++) {
        currentConcList[i] = [...icList];
        console.log("currentConc updated for "+i)
        console.log(currentConcList)
    }

    
}

// delete a row of the species table to remove a species
$(".speciestable").on('click', '.rm-species', function () {
    $(this).closest('tr').remove();
});


// add one reactant to a reaction in the rxn table
$(".rxntable").on('click', '.add-reactant', function () {
    var newDropdown = '<td>+</td><td><select class="reactant-select"></select></td>';
    $(this).parent().last().before(newDropdown);
    updateSpecies();
});


// add one product to a reaction in the rxn table
$(".rxntable").on('click', '.add-product', function () {
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
    newRow +='<td>$$\\xrightarrow{\\text{k_'+rxnNum+'}}$$</td>'; // arrow
    newRow +='<td><select class="product-select"></select></td>'; // product selector
    newRow +='<td><button class="add-product">+</button></td>'; // add product button
    newRow += '</tr>';
    $(".rxntable tbody").append(newRow);
    updateSpecies();
    MathJax.typeset();
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

    // Update system diagram plot
    displayDiagram(getGraphJson(speciesList, stoichMatrix))


    // load MathJax again for it to process the update
    MathJax.typeset();
});



// Look over reaction table & remove empty reactions
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
    // record max sim time, # trajectories
    simTime = $('input[name="time"]').val();
    numTrajectories = $('input[name="nmodels"]').val();
    paramVar = parseFloat($('input[name="variance"]').val());

    // update species just in case
    updateSpecies();
    updateIC();
    // update stoichiometry matrix
    updateStoichMatrix();
    // update initial state display
    displayIC(speciesList);
    // update time display
    $("#init-time-readout").val("0");
    $("#rxn-int-readout").val("0");
    $("#curr-time-readout").val("0");

    // update propensity matrix
    rxnInfo = getReactionInfo();
    updateFormalPropList(rxnInfo); 
    for(let i = 0; i < numTrajectories; i++) {
        updatePropList(i, rxnInfo);
        currTime[i] = 0;
    }
    // display prop matrix for first trajectory
    displayPropMatrix(0);
    // create/reset rxn_log
    setupRxnLog();



    // update trajectory data
    updateTrajectoryData(currTime);

    // update trajectory display legend
    updateTrajLegend(speciesList)
    // update legend in reaction select display
    updateRxnLegend();


});



    // // if time is 0, reset trajectory data
    // if(currTime[0] == 0) {
    //     // get start data
    //     traj_time = [0,0,0]
    //     traj_conc = [1,0,0]
    //     traj_spec = [0,1,2]
    //     traj_tID = [0,0,0]


    //     // Combine data into objects
    //     dataset_traj = []
    //     for (var i = 0; i < traj_time.length; i++) {
    //         dataset_traj.push({
    //             traj_time: traj_time[i],
    //             traj_conc: traj_conc[i],
    //             traj_spec: traj_spec[i],
    //             traj_tID: traj_tID[i]
    //     });
    //     }
    // }


    



function updateTrajectoryData(currTime) {

    numSpecies = currentConcList[0].length
    // initialize trajectories if time==0
    if(currTime[0] == 0) {
        dataset_traj = []

        for(let i = 0; i < numTrajectories; i++) { 
            new_time = Array(numSpecies).fill(currTime[i]);
            new_conc = [...currentConcList[i]];
            new_spec = [...Array(numSpecies).keys()];
            new_tID = Array(numSpecies).fill(i);
            times[i] = []



            // Combine data into objects
            for (var j = 0; j < new_time.length; j++) {
                dataset_traj.push({
                    traj_time: new_time[j],
                    traj_conc: new_conc[j],
                    traj_spec: new_spec[j],
                    traj_tID: new_tID[j]
            });
            }
        }
    }

    // update trajectories
    for(let i = 0; i < numTrajectories; i++) {       
        //trajectory[i].push(currentConcList[i]);
        times[i].push(currTime);
    }
}

function displayIC(speciesList) {
    var icMatrix = '<h5>Initial State X</h5> \n$$\\begin{bmatrix}\n';
    //icList = [];
    speciesList.forEach(species => {
        if(species != "None") {
            var speciesIC = $(".species[value="+species+"]").parent().parent().find(".species_ic").val();
            icMatrix += '\\text{'+species+'} = '+speciesIC+' \\\\\n';
            //icList.push(parseFloat(speciesIC));
        }
    });
    //currentConcList[0] = [...icList];
    icMatrix += '\\end{bmatrix}$$';
    $("#icDisplay").empty();
    $("#icDisplay").append(icMatrix);

    // load MathJax again for it to process the update
    MathJax.typeset();



}


// get formal & actual propensity function for one reaction
// todo: rewrite using rxnInfo instead?
function getRxnPropensity(rxn, trajID) {


    var rxnNum = rxn.rxnNum;
    var reactants = rxn.reactants;
    var actualProp = rxn.rxnProp;

    // compute propensity
    let uniqueReactants = [...new Set(reactants)]
    uniqueReactants.forEach(rct => {
        // get reactant index in species list
        var rctNum = speciesList.findIndex(function(x) {
            return x == rct;
        })-1;
        var count = reactants.filter((r) => r == rct).length

        // get reactant concentration
        var rctCon = parseFloat(currentConcList[trajID][rctNum]);
        for(i in [...Array(count).keys()]) {
            actualProp *= (rctCon - i);
        }
        
    });
    return Math.max(0, actualProp);
    
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


function getReactionInfo() {
    var rxnInfo = [];

    // iterate over each reaction
    $(".rxntable tr").each( function() {
        var arrSize = speciesList.length-1
        var inputs = new Array(arrSize); for (let i=0; i<arrSize; ++i) inputs[i] = 0;
        var outputs = new Array(arrSize); for (let i=0; i<arrSize; ++i) outputs[i] = 0;
        var rxnNo;
        var reactantList = [];
        var productList = [];

        rxnNo = parseInt($(this).find("td.rxnnum").text());
        rxnProp = $(".param-input-field[name=k_"+rxnNo+"]").val();
        //".param-input-field[name="+k+"]"
        // update inputs vector: loop over reactants & add to rxnInfo
        $(this).find("td select.reactant-select").find(":selected").each(function() {
            if($(this).val() != "None") {
                var species = $(this).val();
                var rctNum = speciesList.findIndex(function(x) {
                    return x==species;
                })-1;
                inputs[rctNum] += 1;
                reactantList.push(species);
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
                productList.push(species);
            }  
        });

        
        // update rxnInfo accordingly:
        // inputs are reactants
        // outputs are products
            // if no outputs, add "None" to products
        if(productList.length == 0) {
            productList.push("None")
        }
        
        rxnInfo.push({
            rxnNumber: rxnNo,
            rxnProp: rxnProp,
            reactants: reactantList,
            products: productList
        });

    });

    return(rxnInfo);

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



function updatePropList(trajID, rxnInfo) {
    propList[trajID] = [];
    var rxnNum;

    rxnInfo.forEach((rxn, i) => {
        
        var rxnProps = getRxnPropensity(rxn, trajID);
        propList[trajID].push(rxnProps);

    });

}



function updateFormalPropList(rxnInfo) {
    formalPropList = [];
    // iterate over each reaction
    $(".rxntable tr").each( function() {
        // get rxn number
        var rxnNum = parseInt($(this).find("td.rxnnum").html());
        var rxnProps = getRxnFormalPropensity(rxnNum, rxnInfo);
        formalPropList.push(rxnProps);
        
    });

}

// todo: fix this implementation of multimers
function getRxnFormalPropensity(rxnNum, rxnInfo) {

    console.log("getting formal prop for rxn "+ rxnNum);
    // allocate output vars
    var formalProp = 'k_'+rxnNum;
    
    var k = $(".param-input-field[name="+formalProp+"]").val();
    //var actualProp = parseFloat(k);
    formalProp = "$$" + formalProp
    formalProp += '*';
    
    // get reactants for the rxn
    var reactants = rxnInfo[rxnNum-1].reactants

    // cat together formal propensity, while computing actual
    let uniqueReactants = [...new Set(reactants)]
    uniqueReactants.forEach(rct => {
        // get reactant index in species list
        var rctNum = speciesList.findIndex(function(x) {
            return x == rct;
        })-1;
        var tmp = 'X['+rctNum+']'
        var count = reactants.filter((r) => r == rct).length
        if(count == 1) {
            formalProp += 'X['+rctNum+']';
        } else if (count == 2) {
            formalProp += 'X['+rctNum+']'+'(X['+rctNum+']-1)';
        } else if (count == 3) {
            formalProp += 'X['+rctNum+']'+'(X['+rctNum+']-1)'+'(X['+rctNum+']-2)';
        }
        
    });
    formalProp +="$$";

    return formalProp;
    
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
        var rxnProps = propList[0][rxnNum-1].toFixed(2);
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
    MathJax.typeset();
}


// on step: update all displays for one reaction
var rxnInfo;
$("#sim-step").click(function() {
    simStep();
})

// on go/stop: run simStep at an interval
// TODO: add a parameter disabling some of the visuals lol
let timer;
let run;
$("#sim-toggle").click(function() {
    if(simRunning == false) {
        simRunning = true;
        //$(this).attr('button-style')
        run = setInterval(simStep, 25);

    } else {
        simRunning = false;
        clearInterval(run);
    }
    
})


function addvector(a,b){
    return a.map((e,i) => parseFloat(e) + parseFloat(b[i]));
}

function simStep() {


    
    // store previous state to track single trajectory
    var prevConcList = [...currentConcList[0]];

    // loop over each reaction trajectory
    for(let x = 0; x < numTrajectories; x++) {

        //
        updatePropList(x, rxnInfo);
        // obtain reaction time interval
        // generate a random number
        var rand = Math.random();
        temp = [...propList[x]]
        var sum = temp.reduce((partialSum, a) => parseFloat(partialSum) + parseFloat(a), 0);
        var tau = -1*Math.log((1-rand)) / sum;
        currTime[x] += tau;

        // select a reaction
        rand2 = Math.random();
        var randRxn = rand2*sum;

        var rxn = 0;
        var cumsum = 0;
        for(let prop of propList[x]) {
            cumsum += parseFloat(prop);
            if(cumsum >= randRxn) {
                break;
            }
            rxn += 1;
        }; 

        // compute new system state
        var rxnVector = stoichMatrix[rxn];
        currentConcList[x] = addvector(currentConcList[x],rxnVector);
        //[...currentConcList[i].map((n, i) => parseFloat(n) + parseFloat(rxnVector[i]))];

        if(x == 0 && !simRunning) {
            // update plots in the case of single trajectory simulation
            // update waiting time plot display
            displayWaitingUnif(rand);
            displayWaitingExp(rand, tau);
            updateTimeDisplay(tau);

            // update selected reaction display
            displayRxnSelect(randRxn, sum, rxn+1);

            // update system state display
            updatePrevStateDisplay(rxn, prevConcList);
            
            // update propensity display
            displayPropMatrix();
        }

        

    }


    // update trajectory data
    updateTrajectoryData(currTime);

    // update trajectory plot
    updateTrajDisplay(currTime);

    

}


function updatePrevStateDisplay(rxn, prevConcList) {
    // First, update previous state 
    var outMatrix = '$$\\begin{bmatrix}\n';
    speciesList.forEach((species, i) => {
        if(species != "None") {
            var speciesConc = prevConcList[i-1];
            outMatrix += speciesConc+' \\\\\n';
        }
    });
    outMatrix += '\\end{bmatrix} +';

    // Next, get the column representing the selected reaction
    outMatrix += '\\begin{bmatrix}\n';
    var rxnVector = stoichMatrix[rxn];

    speciesList.forEach((species, i) => {
        if(species != "None") {
            var speciesConc = rxnVector[i-1];
            outMatrix += speciesConc+' \\\\\n';
        }
    });
    outMatrix += '\\end{bmatrix} =';

    // Finally, update the new state
    outMatrix += '\\begin{bmatrix}\n';
    var rxnVector = stoichMatrix[rxn];

    speciesList.forEach((species, i) => {
        if(species != "None") {
            var speciesConc = currentConcList[0][i-1];
            outMatrix += speciesConc+' \\\\\n';
        }
    });
    outMatrix += "\\end{bmatrix} $$"



    $("#curr-state-display").empty();
    $("#curr-state-display").append(outMatrix);

    // load MathJax again for it to process the update
    MathJax.typeset();

}


// Update display of waiting times in SSA Setup, top panel
function updateTimeDisplay(tau) {
    var lastTime = parseFloat($("#curr-time-readout").val());
    var newTime = lastTime + tau

    $("#init-time-readout").val(lastTime);
    $("#rxn-int-readout").val(tau);
    $("#curr-time-readout").val(newTime);
}


// function getRxnInterval(trajID) {
//     // generate a random number
//     //var rand = Math.random();
//     var sum = propList[trajID].reduce((partialSum, a) => parseFloat(partialSum) + parseFloat(a), 0);
//     var tau = -1*Math.log(rand) / sum;
//     return(tau);
// }



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
    var w = 200
    var h = 200
    var padding = {top: 15, bottom: 25, left: 25, right: 5}

    xScale = d3.scaleLinear()
                    .domain([d3.min(x, function(d) { return d }), d3.max(x, function(d) { return d })])
                    .range([padding.left, w - padding.right * 2])

    yScale = d3.scaleLinear()
                .domain([0, 3])
                .range([h - padding.bottom, padding.top])

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
            .attr('transform', 'translate(0,' + (h - padding.bottom) + ')')
            .call(xAxis)
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + padding.left + ',0)')
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
var y2_tau = [0, 1]

var dataset_tausamp = []
dataset_tausamp= transpose([x2_tau,y2_tau])




function drawWaitingExpDisplay() {
    var w = 200
    var h = 200
    var padding = {top: 15, bottom: 25, left: 25, right: 5}

    xScale_exp = d3.scaleLinear()
                    .domain([d3.min(x_exp, function(d) { return d }), d3.max(x_exp, function(d) { return d })])
                    .range([padding.left, w - padding.right * 2])

    yScale_exp = d3.scaleLinear()
                .domain([0, 1])
                .range([h - padding.bottom, padding.top])

    function mycanvas() {
        var svg = d3.select('svg#waiting-exp-display')
                .attr('width', w)
                .attr('height', h)
        svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'lightgrey')

        // Define the axis
        var xAxis_exp = d3.axisBottom().scale(xScale_exp).ticks(9)
        var yAxis_exp = d3.axisLeft().scale(yScale_exp).ticks(9)
        // Create the axis
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (h - padding.bottom) + ')')
            .call(xAxis_exp)
        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + padding.left + ',0)')
            .call(yAxis_exp)

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


    var padding = {top: 15, bottom: 25, left: 25, right: 5}

    // Generate data from an exponential distribution with parameter sum(propList)
    // For the exponential distribution use 4x variance to set the x domain. Variance is 1/lambda
    lambda = d3.sum(propList[0]);
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

    var w = 200
    var h = 200

    xScale_exp = d3.scaleLinear()
                    .domain([d3.min(x_exp, function(d) { return d }), d3.max(x_exp, function(d) { return d })])
                    .range([padding.left, w - padding.right * 2])

    yScale_exp = d3.scaleLinear()
                .domain([0, 1])
                .range([h - padding.bottom, padding.top])


    // Define the axis
    var xAxis_exp = d3.axisBottom().scale(xScale_exp).ticks(9)
    var yAxis_exp = d3.axisLeft().scale(yScale_exp).ticks(9)
   


    //var svg = d3.select('svg#waiting-unif-display');
    var svg = d3.select('#waiting-exp-container').transition();

    // update axes
    svg.selectAll(".x.axis")
        .call(xAxis_exp)
    svg.selectAll(".y.axis")
        .call(yAxis_exp)


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


// Finally, generate a vertical line at x = tau
//var x_rxnSelect = ["Propensity", "Propensity", "Propensity", "Propensity", "Sample"]; 
var y_rxnSelect = [0.2, 0, 0, 0]


var rxnNum_rxnSelect = ["k_1", "k_2", "k_3", "k_4"]
var dataset_rxnSelect = []

string_csv = 'group,k_1,k_2,k_3,k_4\nPropensity,'+y_rxnSelect.reduce((acc, add) => acc += ","+add)+'\nSample,0.1,0,0,0';
dataset_rxnSelect = d3.csvParse(string_csv);

var subgroups = dataset_rxnSelect.columns.slice(1) //rxnNum_rxnSelect

// List of groups = species here = value of the first column called group -> I show them on the X axis
var groups = d3.map(dataset_rxnSelect, function(d){return(d.group)}).keys()



function drawRxnSelectDisplay() {

    var w = 200
    var h = 200
    var padding = {top: 15, bottom: 25, left: 30, right: 35}

    xScale_rxnSelect = d3.scaleBand()
                    .domain(["Propensity","Sample"])
                    .range([padding.left, w - padding.right * 2])

    yScale_rxnSelect = d3.scaleLinear()
                .domain([0, 1.2*d3.sum(y_rxnSelect)])
                .range([h - padding.bottom, padding.top])

    var svg = d3.select('svg#rxn-select-display')
        .attr('width', w)
        .attr('height', h)
    svg.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'lightgrey')

    // Define the axis
    //xAxis_rxnSelect = d3.axisBottom().scale(xScale_rxnSelect).tickSizeOuter(0)
    //yAxis_rxnSelect = d3.axisLeft().scale(yScale_rxnSelect).ticks(9)
    // Create the axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (h - padding.bottom) + ')')
        .call(d3.axisBottom(xScale_rxnSelect).tickSizeOuter(0));
    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + padding.left + ',0)')
        .call(d3.axisLeft(yScale_rxnSelect));



    displayRxnSelect(0,d3.sum(y_rxnSelect),1);

}



// Update rxnSelect display
// Waiting time graphic
// set up uniform distribution visual
function displayRxnSelect(randRxn, sum, rxnNum) {



    sampList = new Array(propList[0].length).fill(0)
    sampList[rxnNum-1] = randRxn



    // Create new data string
    string_csv = 'group,k_1,k_2,k_3,k_4\nPropensity,'+propList[0].reduce((acc, add) => acc += ","+add)+
        '\nSample,'+sampList.reduce((acc, add) => acc += ","+add);
    dataset_rxnSelect = d3.csvParse(string_csv);

    // Update plot
    var w = 200
    var h = 200
    var padding = {top: 15, bottom: 25, left: 30, right: 35}

    xScale_rxnSelect = d3.scaleBand()
                    .domain(["Propensity","Sample"])
                    .range([padding.left, w - padding.right * 2])
                    .paddingInner(0.05);

    yScale_rxnSelect = d3.scaleLinear()
                .domain([0, 1.2*d3.sum(propList[0])])
                .range([h - padding.bottom, padding.top])




    console.log("rxnNum_rxnSelect:")
    console.log(rxnNum_rxnSelect)
    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(rxnNum_rxnSelect)
        .range(["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#000000"])

    //stack the data? --> stack per subgroup
    //var stackedData = d3.stack()
    //.keys(subgroups)
    //(dataset_rxnSelect)


    var stack = d3.stack()
        .keys(subgroups)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);


    var svg = d3.select('svg#rxn-select-display');
    //var svg = d3.select('#rxn-select-container').transition();

    // update y-axis
    svg.selectAll(".y.axis")
        .call(d3.axisLeft(yScale_rxnSelect));


    // each data column (a.k.a "key" or "series") needs to be iterated over
    subgroups.forEach(function(key, key_index){

        var bar = svg.selectAll(".bar-" + key)
            .data(stack(dataset_rxnSelect)[key_index], function(d){ return d.data["group"] + "-" + key; });
   
        bar
            .transition()
            .attr("x", function(d){ return xScale_rxnSelect(d.data["group"]); })
            .attr("y", function(d){ return yScale_rxnSelect(d[1]); })
            .attr("height", function(d){ return yScale_rxnSelect(d[0]) - yScale_rxnSelect(d[1]); })

        bar.enter().append("rect")
            .attr("class", function(d){ return "bar bar-" + key; })
            .attr("x", function(d){ return xScale_rxnSelect(d.data.group); })
            .attr("y", function(d){ return yScale_rxnSelect(d[1]); })
            .attr("height", function(d){ return yScale_rxnSelect(d[0]) - yScale_rxnSelect(d[1]); })
            .attr("width", xScale_rxnSelect.bandwidth())
            .attr("fill", function(d){ 
                console.log("in barchart, key:")
                console.log(key)
                console.log("color for key:")
                console.log(color(key))
                return color(key); })

    });            


}




function updateRxnLegend() {
    var w = 200

    // Select plot
    var svg = d3.select('#rxn-select-display');

    var numRxns = parseInt($(".rxntable tr td.rxnnum").last().html());
    var formalProps = [...Array(numRxns).keys()];
    formalProps = formalProps.map(i => "k_"+parseInt(i+1));


    var subgroups = dataset_rxnSelect.columns.slice(1)

    console.log("subgroups:")
    console.log(subgroups)

    console.log("formalProps:")
    console.log(formalProps)

    // Define the color scale
    const color = d3.scaleOrdinal()
        .domain(formalProps)
        .range(["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#000000"])

    // Define legend
    var legend = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .scale(color)
        .labels(formalProps)

    svg.append('g')
        .attr("transform","translate("+w*0.75+", 80)")
        .attr("class", "legend")
        .call(legend);

    svg.legends = [];
}



// Draw initial plot for trajectory display


// Generate the initial trajectory data
// mock start data for multiple trajectories
// var traj_time = [0,0,0,3,3,3,0,0,0,2,2,2]
// var traj_conc = [1,0,0,0,1,10,1,0,0,0,1,5]
// var traj_spec = [0,1,2,0,1,2,0,1,2,0,1,2]
// var traj_tID = [0,0,0,0,0,0,1,1,1,1,1,1]

// mock start data for one trajectory
// var traj_time = [0,0,0,3,3,3]
// var traj_conc = [1,0,0,0,1,10]
// var traj_spec = [0,1,2,0,1,2]
// var traj_tID = [0,0,0,0,0,0]

// mock start data for one trajectory, only start points
var traj_time = [0,0,0]
var traj_conc = [1,0,0]
var traj_spec = [0,1,2]
var traj_tID = [0,0,0]

// with nothing
// var traj_time = []
// var traj_conc = []
// var traj_spec = []
// var traj_tID = []



// Combine data into objects
var dataset_traj = []
for (var i = 0; i < traj_time.length; i++) {
    dataset_traj.push({
        traj_time: traj_time[i],
        traj_conc: traj_conc[i],
        traj_spec: traj_spec[i],
        traj_tID: traj_tID[i]
  });
}


//dataset_traj= transpose([traj_time,traj_conc,traj_spec,traj_tID]);
// dataset_traj[0] = traj_time;
// dataset_traj[1] = traj_conc;
// dataset_traj[2] = traj_spec;
// dataset_traj[3] = traj_tID;
console.log("trajectory dataset:");
console.log(dataset_traj);
//console.log("accessing by name: ")
//console.log([...new Set(dataset_traj.map(d => d.traj_spec))]);


function drawTrajectoryDisplay() {
    var w = 800
    var h = 300
    var padding = 25
    var padding = {top: 15, bottom: 25, left: 30, right: 50}
    var speciesIDs = [...new Set(dataset_traj.map(d => d.traj_spec))]; 


    var svg = d3.select('svg#traj-display')
                .attr('width', w)
                .attr('height', h)
        svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'lightgrey')


    // Nest the data by species
    var nestedData = d3.nest()
        .key(function(d){
            return d.traj_spec;
        })
        .key(function(d){
            return d.traj_tID;
        })
        .entries(dataset_traj);
    
    //.group(dataset_traj, d=>d.traj_spec, d=>d.traj_tID);


    xScale_traj = d3.scaleLinear()
                    .domain([d3.min(dataset_traj, function(d) { return d.traj_time }), d3.max(dataset_traj, function(d) { return d.traj_time })])
                    .range([padding.left, w - padding.right * 2])
    var xAxis_traj = d3.axisBottom().scale(xScale_traj).ticks(9)
    // Create the x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (h - padding.bottom) + ')')
        .call(xAxis_traj)

    // Create y-axis
    yScale_traj = d3.scaleLinear()
                .domain([d3.min(dataset_traj, function(d) { return d.traj_conc }), d3.max(dataset_traj, function(d) { return d.traj_conc })])
                .range([h - padding.bottom, padding.top])
    var yAxis_traj = d3.axisLeft().scale(yScale_traj).ticks(9)

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + padding.left + ',0)')
        .call(yAxis_traj)

    // Define the color scale
    const color = d3.scaleOrdinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']); // color scale


    // Define the line
    var valueLine = d3.line()
        .x(function(d) { return xScale_traj(d.traj_time); })
        .y(function(d) { return yScale_traj(+d.traj_conc); })
 

    // the old way, no keys
     var specGroups = svg.selectAll(".specGroup")
        .data(nestedData)
        .enter()
        .append("g")
        .attr("stroke", function(d) { return color(d.key)})
        .attr("class", function(d) {return "specGroup"})

    var paths = specGroups.selectAll(".traj")
        .data(function(d){ 
            return d.values; 
        })
        .enter()
        .append("path");
    paths.attr("fill", "none")
        .attr("d", function(d) { return valueLine(d.values)})
        .attr("class", "traj")


    // define legend
    // var legend = d3.legendColor()
    //     .labelFormat(d3.format(".2f"))
    //     //.useClass(true)
    //     .scale(color);

    // svg.append('g')
    //     .attr("transform","translate("+w*0.9+", 80)")
    //     .attr("class", "legend")
    //     .call(legend);



}



function updateTrajLegend(speciesList) {

    var w = 800
    var h = 300

    var legendSpecies = [...speciesList]
    legendSpecies.shift();
    console.log("legendSpecies:")
    console.log(legendSpecies)


    // Select plot
    var svg = d3.select('#traj-display');

    // Define the color scale
    const color = d3.scaleOrdinal()
        .domain(legendSpecies)
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']); 


    var legend = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        //.useClass(true)
        .scale(color)
        .labels(legendSpecies)
        .on("cellclick", function(d){
            //console.log("Clicked on color " + color(d));
            currentOpacity = d3.selectAll("g[stroke='"+color(d)+"']").style("opacity")
            test = svg.selectAll("g[stroke='"+color(d)+"']").transition().style("opacity", currentOpacity == 1 ? 0:1);
        });;

    svg.append('g')
        .attr("transform","translate("+w*0.87+", 80)")
        .attr("class", "legend")
        .call(legend);

    svg.legends = [];
}


// Update trajectory display
function updateTrajDisplay(currTime) {


    var numSpecies = currentConcList[0].length;

    // loop over trajectories to update data
    for(let i = 0; i < numTrajectories; i++) {
        new_time = Array(numSpecies).fill(currTime[i]);
        new_conc = [...currentConcList[i]];
        new_spec = [...Array(numSpecies).keys()];
        new_tID = Array(numSpecies).fill(i);

        // Combine data into objects
        for (var j = 0; j < new_time.length; j++) {
            dataset_traj.push({
                traj_time: new_time[j],
                traj_conc: new_conc[j],
                traj_spec: new_spec[j],
                traj_tID: new_tID[j]
        });
        }

    }


    var speciesIDs = [...new Set(dataset_traj.map(d => d.traj_spec))];

    var w = 800
    var h = 300
    var padding = 25
    var padding = {top: 15, bottom: 25, left: 30, right: 50}



    // Select plot
    var svg = d3.select('#traj-display');


    // Define the color scale
    const color = d3.scaleOrdinal()
        .domain(speciesIDs)
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']); 

    // Update axes
    xScale_traj = d3.scaleLinear()
        .domain([d3.min(dataset_traj, function(d) { return d.traj_time }), d3.max(dataset_traj, function(d) { return d.traj_time })])
        .range([padding.left, w - padding.right * 2])
    var xAxis_traj = d3.axisBottom().scale(xScale_traj).ticks(9)
    svg.selectAll(".x.axis")
        .transition()  
        .call(xAxis_traj)

    yScale_traj = d3.scaleLinear()
        .domain([d3.min(dataset_traj, function(d) { return d.traj_conc }), d3.max(dataset_traj, function(d) { return d.traj_conc })])
        .range([h - padding.bottom, padding.top])
    var yAxis_traj = d3.axisLeft().scale(yScale_traj).ticks(9)
    svg.selectAll(".y.axis")
        .transition()
        .call(yAxis_traj)


    // define a mapping for lines
    // Define the line
    var valueLine = d3.line()
        .x(function(d) { return xScale_traj(d.traj_time); })
        .y(function(d) { return yScale_traj(+d.traj_conc); })


   

    // Nest the data by species
    var nestedData = d3.nest()
        .key(function(d){
            return d.traj_spec;
        })
        .key(function(d){
            return d.traj_tID;
        })
        .entries(dataset_traj);
        


    // Update data
    // Select all of the grouped elements and update the data
    var selectGroups = svg.selectAll("g.specGroup")
        .data(nestedData)
        
    selectGroups
        .enter()
        .append("g")
        .attr("stroke", function(d) { return color(d.key)})
        .attr("class", function(d) {return "specGroup"})


    // Select all the lines and transition to new positions
    lines = selectGroups.selectAll(".traj_new").data(function(d){
            return (d.values)
            }).attr("d", function(d) { return valueLine(d.values)})

    //lines.exit().remove()
    lines.enter()
            .append("path")
            .attr("fill","none")
            .attr("class","traj_new")
            .attr("d", function(d) { return valueLine(d.values)})
            .transition()
    
    
    // update legend - frustratingly, the plot overwrites it if you dont
    //updateTrajLegend(speciesList);


}




function drawEnsembleDisplay() {
    var w = 300
    var h = 300
    var padding = {top: 15, bottom: 25, left: 30, right: 50}
    var speciesIDs = [...new Set(dataset_traj.map(d => d.traj_spec))]; 


    var svg = d3.select('svg#ensemble-display')
                .attr('width', w)
                .attr('height', h)
        svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'lightgrey')


    // Nest the data by species?
    // var nestedData = d3.nest()
    //     .key(function(d){
    //         return d.traj_spec;
    //     })
    //     .key(function(d){
    //         return d.traj_tID;
    //     })
    //     .entries(dataset_traj);



    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([ 0, w ])
        .domain(myGroups)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + h + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([ h, 0 ])
        .domain(myVars)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()

}



function getGraphJson(speciesList, stoichMatrix) {
    var nodes = []
    // first, create a node for every species
    for(spec in speciesList) {
        //out += '{"id": "'+speciesList[spec]+'"},';
        nodes.push({
            id: spec,
            label: speciesList[spec]
        });
    }

    var rxnInfo = getReactionInfo();
    var edges = []

    // rescale widths to a range of 1-max
    var maxWidth = 5;
    var props = rxnInfo.map(x => parseFloat(x.rxnProp));
    var max = Math.max(...props);
    props = props.map(item => Math.log10(item+1));
    props = props.map(item => item * maxWidth);
    
    // loop over each reaction. Find negative coefficients (reactants) & positive coefficients (products), then connect each one with an edge
    for(r in [...Array(stoichMatrix.length).keys()]) {

        reactants = rxnInfo[r].reactants
        products = rxnInfo[r].products
        edgeLabel = `k${rxnInfo[r].rxnNumber} = ${rxnInfo[r].rxnProp}`
        var w = props[r];

        // add an edge connecting reactants to products
        for(rc in reactants) {
            for(p in products) {
                //out += '{ "from": "' + speciesList[parseInt(reactants[r])+1] + '",\n "to": "' + speciesList[parseInt(products[p])+1] + '"},'
                var rID = speciesList.findIndex(function(x) { return x == reactants[rc]; });
                var pID = speciesList.findIndex(function(x) { return x == products[p]; });

                // first, check if the edge already exists
                var edgeExists = false;
                for(var e in edges) {
                    if(edges[e].from == rID & edges[e].to == pID & edges[e].title == edgeLabel) {
                        edgeExists = true;
                    }
                }
                
                if(!edgeExists) {
                    edges.push({
                        from: rID,
                        to: pID,
                        title: edgeLabel,
                        width: w,
                        arrows: {
                            to: {
                              enabled: true,
                              type: "arrow",
                            },
                          },
                        font: {
                            align: "top",
                        },
                    });

                }
                
            }
        }

    }
    
    var out = {
        nodes: nodes,
        edges: edges
    }
    return(out)

}


function displayDiagram(json) {
    
    // create a network
    var container = document.getElementById("diagram-container");
    var options = {width: '400px',height: '250px'};
    var network = new vis.Network(container, json, options);
}




// initialize plots
drawWaitingUnifDisplay();
drawWaitingExpDisplay();
drawRxnSelectDisplay();
drawTrajectoryDisplay();
drawEnsembleDisplay();
