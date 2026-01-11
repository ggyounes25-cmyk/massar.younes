import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSy...", 
    authDomain: "mygrades-30e38.firebaseapp.com",
    databaseURL: "https://mygrades-30e38-default-rtdb.firebaseio.com/", 
    projectId: "mygrades-30e38",
    storageBucket: "mygrades-30e38.appspot.com",
    messagingSenderId: "776044733479",
    appId: "1:776044733479:web:..."
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// قائمة المواد الصحيحة
const subjects = [
    { name: "الرياضيات", coef: 7 },
    { name: "الفيزياء والكيمياء", coef: 7 },
    { name: "علوم الحياة والأرض", coef: 5 },
    { name: "الفلسفة", coef: 2 },
    { name: "الإنجليزية", coef: 2 },
    { name: "اللغة العربية", coef: 2 },
    { name: "اللغة الفرنسية", coef: 4 },
    { name: "التربية البدنية", coef: 4 }, // تم التعديل هنا
    { name: "التربية الإسلامية", coef: 2 }
];

window.onload = function() {
    const savedUser = localStorage.getItem('active_user');
    if (savedUser) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        buildTable();
        loadSavedData();
    }
};

window.loginUser = function() {
    const nameInput = document.getElementById('user-fullname');
    if (nameInput.value.trim() !== "") {
        push(ref(database, 'users'), { username: nameInput.value, time: new Date().toLocaleString() });
        localStorage.setItem('active_user', nameInput.value);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        buildTable();
    }
};

function buildTable() {
    const tbody = document.getElementById('gradesTable');
    let html = `
        <tr class="behavior-row" style="background: rgba(255, 215, 0, 0.05);">
            <td style="text-align:right;"><strong>⭐ السلوك</strong></td>
            <td><span class="coef-badge">1</span></td>
            <td colspan="5">
                <input type="number" id="behavior-score" oninput="valCalc(this)" style="width: 90%; font-weight:bold" placeholder="0-20">
            </td>
            <td id="behavior-val" class="result-cell" style="font-weight:bold;">-</td>
        </tr>
    `;
    
    html += subjects.map((sub, i) => `
        <tr>
            <td style="text-align:right; font-weight:600;">${sub.name}</td>
            <td><span class="coef-badge">${sub.coef}</span></td>
            <td><input type="number" id="f1-${i}" oninput="valCalc(this)"></td>
            <td><input type="number" id="f2-${i}" oninput="valCalc(this)"></td>
            <td><input type="number" id="f3-${i}" oninput="valCalc(this)"></td>
            <td><input type="number" id="f4-${i}" oninput="valCalc(this)"></td>
            <td><input type="number" id="act-${i}" oninput="valCalc(this)"></td>
            <td id="total-${i}" class="result-cell">-</td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

window.valCalc = function(input) {
    let val = parseFloat(input.value);
    if (val > 20) input.value = 20;
    if (val < 0) input.value = 0;
    saveToLocal();
    calculateAll();
};

function saveToLocal() {
    const data = { grades: {}, behavior: document.getElementById('behavior-score').value };
    subjects.forEach((_, i) => {
        data.grades[`row-${i}`] = {
            f1: document.getElementById(`f1-${i}`).value,
            f2: document.getElementById(`f2-${i}`).value,
            f3: document.getElementById(`f3-${i}`).value,
            f4: document.getElementById(`f4-${i}`).value,
            act: document.getElementById(`act-${i}`).value
        };
    });
    localStorage.setItem('my_academic_data', JSON.stringify(data));
}

function loadSavedData() {
    const saved = JSON.parse(localStorage.getItem('my_academic_data'));
    if (saved) {
        document.getElementById('behavior-score').value = saved.behavior || "";
        subjects.forEach((_, i) => {
            const row = saved.grades[`row-${i}`];
            if (row) {
                ['f1','f2','f3','f4','act'].forEach(key => {
                    document.getElementById(`${key}-${i}`).value = row[key];
                });
            }
        });
        calculateAll();
    }
}

function calculateAll() {
    let tPoints = 0; let tCoefs = 0;
    subjects.forEach((sub, i) => {
        let f = [1,2,3,4].map(n => document.getElementById(`f${n}-${i}`).value).filter(v => v !== "").map(Number);
        let act = document.getElementById(`act-${i}`).value;
        let cell = document.getElementById(`total-${i}`);
        
        if (f.length > 0 || act !== "") {
            let mAvg = f.length > 0 ? (f.reduce((a,b)=>a+b)/f.length) : 0;
            let final = (act === "") ? mAvg : (mAvg * 0.75) + (Number(act) * 0.25);
            cell.innerText = final.toFixed(2);
            cell.className = final >= 10 ? "result-cell good" : "result-cell bad";
            tPoints += (final * sub.coef);
            tCoefs += sub.coef;
        }
    });

    let bScore = document.getElementById('behavior-score').value;
    if(bScore !== "") {
        let bVal = parseFloat(bScore);
        document.getElementById('behavior-val').innerText = bVal.toFixed(2);
        document.getElementById('behavior-val').className = bVal >= 10 ? "result-cell good" : "result-cell bad";
        tPoints += bVal; tCoefs += 1;
    }

    let totalAvg = tCoefs > 0 ? (tPoints / tCoefs) : 0;
    const res = document.getElementById('final-avg');
    res.innerText = totalAvg.toFixed(2);
    res.className = totalAvg >= 10 ? "score-value good" : "score-value bad";
}
