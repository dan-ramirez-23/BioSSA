//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;
var speciesList = ["None"];

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
        var emptyCell = '<td contenteditable="true" class="species"></td>';
        tds += emptyCell;
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
    $(".speciestable tbody tr td.species").each(function () {
        speciesList.push($(this).html());
    });
    //update rxn table dropdowns
    //empty dropdown menus
    //$(".rxntable tr td select").empty();

    $(".rxntable tr td select").each(function () {
        var selectedVal = $(this).find(":selected").val();
        var newOption;
        console.log(speciesList);
        console.log(this);
        $(this).empty();
        console.log(this);
        speciesList.forEach(species => {
            if (species == selectedVal) {
                newOption = '<option value="'+species+'" selected>'+species+'</option>';
                //newOption = $('<option></option>').attr("value", species).attr("selected", species).text(species);
            } else {
                //newOption = $('<option></option>').attr("value", species).text(species);
                newOption = '<option value="'+species+'">'+species+'</option>';
            }
            console.log('newOption:' + newOption);
            
            $(this).append(newOption);
        });
    })

}


$(".speciestable").on('click', '.rm-species', function () {
    $(this).closest('tr').remove();
});


$(".add-reactant").click(function () {
    var newDropdown = '<td>+</td><td><select class="reactant-select"></select></td>';
    $(this).parent().last().before(newDropdown);
    updateSpecies();
});


$(".add-product").click(function () {
    var newDropdown = '<td>+</td><td><select class="product-select"></select></td>';
    $(this).parent().last().before(newDropdown);
    updateSpecies();
});




$("#add-rxn").click(function() {
    var newRow = '<tr><td><select class="reactant-select"></select></td><td><button class="add-reactant">+</button></td><td>&#x2192</td><td><select class="product-select"></select></td><td><button class="add-product">+</button></td></tr>';
    //broken up below for readability
    //var newRow = '<tr>';
    //newRow += '<td><select class="reactant-select"></select></td>'; // first reactant selector
    //newRow +='<td><button class="add-reactant">+</button></td>'; // add reactant button 
    //newRow +='<td>&#x2192</td>'; // arrow
    //newRow +='<td><select class="product-select"></select></td>'; // product selector
    //newRow +='<td><button class="add-product">+</button></td>'; // add product button
    //newRow += '</tr>';
    $(".rxntable tbody").append(newRow);
    updateSpecies();
});