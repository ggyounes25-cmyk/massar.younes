const subjects = [
    {name: "الرياضيات", coef: 7}, {name: "الفيزياء", coef: 7},
    {name: "ع.الحياة", coef: 5}, {name: "العربية", coef: 2},
    {name: "الفرنسية", coef: 4}, {name: "الإنجليزية", coef: 2},
    {name: "الفلسفة", coef: 2}, {name: "الإسلامية", coef: 2},
    {name: "البدنية", coef: 4}
];

const tableBody = document.getElementById('gradesTable');

// إنشاء الصفوف
subjects.forEach((sub, i) => {
    let row = `<tr>
        <td style="text-align:right"><strong>${sub.name}</strong></td>
        <td><span class="coef-badge">${sub.coef}</span></td>
        ${[1,2,3,4].map(n => `<td><input type="number" min="0" max="20" step="0.25" id="f${n}-${i}" oninput="validateAndCalc(${i})"></td>`).join('')}
        <td><input type="number" min="0" max="20" step="0.25" id="act-${i}" oninput="validateAndCalc(${i})" style="background:#fff9c4"></td>
        <td id="total-${i}" class="result-cell">-</td>
    </tr>`;
    tableBody.innerHTML += row;
});

function validateAndCalc(i) {
    const inputs = document.querySelectorAll(`input[id$="-${i}"]`);
    inputs.forEach(input => {
        let val = parseFloat(input.value);
        if (val > 20) input.value = 20;
        if (val < 0) input.value = 0;
    });
    calculate();
}

document.getElementById('behavior-score').addEventListener('input', function() {
    if (parseFloat(this.value) > 20) this.value = 20;
    if (parseFloat(this.value) < 0) this.value = 0;
    calculate();
});

function getGradeColor(score) {
    if (score > 10) return `rgba(76, 175, 80, ${Math.min((score-10)/5, 0.4)})`;
    if (score < 10) return `rgba(244, 67, 54, ${Math.min((10-score)/5, 0.4)})`;
    return "white";
}

function calculate() {
    let totalPoints = 0; let totalCoefs = 0;
    subjects.forEach((sub, i) => {
        let f = [1,2,3,4].map(n => document.getElementById(`f${n}-${i}`).value).filter(v => v !== "").map(v => parseFloat(v));
        let act = document.getElementById(`act-${i}`).value;
        let cell = document.getElementById(`total-${i}`);

        if (f.length > 0 || act !== "") {
            let madaAvg = f.length > 0 ? (f.reduce((a,b)=>a+b)/f.length) : 0;
            let final = (act === "") ? madaAvg : (madaAvg * 0.75) + (parseFloat(act) * 0.25);
            cell.innerText = final.toFixed(2);
            cell.style.backgroundColor = getGradeColor(final);
            totalPoints += (final * sub.coef);
            totalCoefs += sub.coef;
        } else { cell.innerText = "-"; cell.style.backgroundColor = "transparent"; }
    });

    let bVal = parseFloat(document.getElementById('behavior-score').value);
    if(!isNaN(bVal)) {
        totalPoints += (bVal * 1); totalCoefs += 1;
        document.getElementById('behavior-val').innerText = bVal;
        document.getElementById('behavior-val').style.backgroundColor = getGradeColor(bVal);
    }

    const avg = totalCoefs > 0 ? (totalPoints / totalCoefs) : 0;
    document.getElementById('final-avg').innerText = avg.toFixed(2);
    updateAppreciation(avg);
}

function updateAppreciation(avg) {
    let text = "بانتظار النقاط...";
    if (avg >= 16) text = "ميزة حسن جداً 🏆";
    else if (avg >= 14) text = "ميزة حسن ✨";
    else if (avg >= 12) text = "ميزة مستحسن 👍";
    else if (avg >= 10) text = "ميزة مقبول ✔️";
    else if (avg > 0) text = "تحتاج لمجهود أكبر ✍️";
    document.getElementById('appreciation-text').innerText = text;
}

function saveData() {
    const data = {};
    document.querySelectorAll('input').forEach(input => data[input.id] = input.value);
    localStorage.setItem('studentGradesMobileV1', JSON.stringify(data));
    alert("تم حفظ النقاط بنجاح!");
}

window.onload = () => {
    const saved = localStorage.getItem('studentGradesMobileV1');
    if (saved) {
        const data = JSON.parse(saved);
        for (const id in data) if(document.getElementById(id)) document.getElementById(id).value = data[id];
        calculate();
    }
};