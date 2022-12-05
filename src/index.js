//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;
var speciesList = ["None"];
var stoichMatrix = [];

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
        speciesList.push($(this).val());
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
    //console.log($(this).parent().last());
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
    var rxnNum = $(".rxntable tr td.rxnnum").last().html();

    //var newRow = '<tr><td><select class="reactant-select"></select></td><td><button class="add-reactant">+</button></td><td>&#x2192</td><td><select class="product-select"></select></td><td><button class="add-product">+</button></td></tr>';
    //broken up below for readability
    var newRow = '<tr>';
    newRow +='<td class="rxndelete"><button>Delete</button></td>'; // rxn delete button
    newRow +='<td class="rxnnum">'+(parseInt(rxnNum)+1)+'. </td>'; // rxn number
    newRow += '<td><select class="reactant-select"></select></td>'; // first reactant selector
    newRow +='<td><button class="add-reactant">+</button></td>'; // add reactant button 
    newRow +='<td>&#x2192</td>'; // arrow
    newRow +='<td><select class="product-select"></select></td>'; // product selector
    newRow +='<td><button class="add-product">+</button></td>'; // add product button
    newRow += '</tr>';
    $(".rxntable tbody").append(newRow);
    updateSpecies();
});


// delete reaction
//$(".rxndelete").click(function() {
//    console.log("test");
 //   console.log($(this).parent());
    //$(this).parent().remove();
//});


$(".rxntable").on('click', '.rxndelete', function () {
    $(this).closest('tr').remove();
});



// confirm reactions
$("#confirm-rxn").click(function () {

    // first, remove all spurious reactions
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
    // update initial state display
    displayIC();
});

function displayIC() {
    var icMatrix = '<h5>Initial State X</h5> \n$$\\begin{bmatrix}\n';
    speciesList.forEach(species => {
        if(species != "None") {
            var speciesIC = $(".species[value="+species+"]").parent().parent().find(".species_ic").val();
            console.log(species);
            console.log(speciesIC);
            icMatrix += '\\text{'+species+'} = '+speciesIC+' \\\\\n';
        }
    });
    icMatrix += '\\end{bmatrix}$$';
    console.log(icMatrix);
    $("#icDisplay").empty();
    $("#icDisplay").append(icMatrix);

    // load MathJax again for it to process the update
    MathJax.typeset();

}


// TODO: the implementation here is shoddy. a better way:
// on confirmr eactions button, update Stoichiometry matrix as a global var and display it
// also update "Previous state" in second panel of "SSA setup"


// get formal & actual propensity function for one reaction
function getRxnPropensity(rxnNum) {
    // loop over reactants
    var formalProp = 'k_'+rxnNum+'*';
    var actualProp = '';
    // get reactants for the rxn
    var reactants = [];
    $(".rxntable tr td select.reactant-select").find(":selected").each(function() {
        if($(this).val() != "None") {
            reactants.push($(this).val());
        }  
    });


    reactants.forEach(rct => {
        var rctNum = speciesList.findIndex(rct)-1;
        formalProp += 'X['+rctNum+']';
    });

    return [formalProp, actualProp];
    
}


function updateStoichMatrix() {
    
}

