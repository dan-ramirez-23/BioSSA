//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;
var speciesList = [];

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
    speciesList = [];
    $(".speciestable tbody tr td.species").each(function () {
        speciesList.push($(this).html());
    });
    //update rxn table dropdowns
    $(".rxntable tr td select").empty();
    speciesList.forEach(species => {
        $(".rxntable tr td select").each(function () {
            var newSelect = $('<option></option>').attr("value", species).text(species);
            $(this).append(newSelect);
        })
    });
});


$(".speciestable").on('click', '.rm-species', function () {
    $(this).closest('tr').remove();
});


$(".add-reactant").click(function () {
    var newDropdown = '<td>+</td><td><select class="reactant-select"></select></td>';
    $(this).parent().last().before(newDropdown);
});