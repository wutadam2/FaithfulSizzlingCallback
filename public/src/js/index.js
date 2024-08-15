function findI(id) {
  return document.getElementById(id);
}
findI("button.check").addEventListener("click", async function () {
  findI("section.results").style.display = "none";
  findI("section.success").style.display = "none";
  findI("section.error").style.display = "none";
  if (findI("input.username").value.replace(/\s/g, "").length > 0) {
    var response = await fetch(`/get_aura/${findI("input.username").value}`);
    var res = await response.text();
    findI("section.results").style.display = "block";
    if (res == "Error") {
      findI("section.error").style.display = "block";
    } else {
      var aura = JSON.parse(res);
      findI("section.success").style.display = "block";
      findI("text.name").innerHTML = findI("input.username").value;
      animateAura(aura.aura);
      findI("text.rank").innerHTML = aura.rank;
    }
  }
});
function animateAura(total) {
  var disp = 0;
  var interval = setInterval(function () {
    disp += Math.ceil((total-disp)/10);
    findI("text.aura").innerHTML = disp.toLocaleString();
    if (disp == total) {
      clearInterval(interval);
    }
  }, 1000/20);
}