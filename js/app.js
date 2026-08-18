const DBKEY="ghaim_fee_data_v1";
const empty={students:[],payments:[]};
function db(){try{return JSON.parse(localStorage.getItem(DBKEY))||empty}catch(e){return empty}}
function saveDB(d){localStorage.setItem(DBKEY,JSON.stringify(d))}
function money(n){return Number(n||0).toLocaleString("ar-SA")}
function today(){return new Date().toISOString().slice(0,10)}
function toggleMenu(){document.body.classList.toggle("open")}
function initDashboard(){const d=db();const paid=d.payments.reduce((s,p)=>s+Number(p.amount),0),fees=d.students.reduce((s,x)=>s+Number(x.fees),0);studentsCount.textContent=money(d.students.length);feesTotal.textContent=money(fees);paidTotal.textContent=money(paid);remainingTotal.textContent=money(Math.max(fees-paid,0));todayPayments.innerHTML=d.payments.filter(p=>p.date===today()).slice(-5).reverse().map(p=>{let s=d.students.find(x=>x.id===p.studentId);return row(p,s)}).join("")||'<div class="empty">لا توجد دفعات اليوم</div>';upcoming.innerHTML=buildSchedule(d).slice(0,5).map(x=>`<tr><td>${x.name}</td><td>${x.level}</td><td>${x.date}</td><td>${money(x.amount)} ريال</td><td><span class="status soon">قادمة</span></td></tr>`).join("")||'<tr><td colspan="5">لا توجد مواعيد مسجلة</td></tr>'}
function row(p,s){return `<div class="payment-row"><div class="person"><div class="avatar-sm">${(s?.name||"?").trim().charAt(0)}</div><div><b>${s?.name||"طالب محذوف"}</b><small>${s?.level||""} · ${p.date}</small></div></div><strong>${money(p.amount)} <small>ريال</small></strong><span class="method ${p.method==="بنكي"?"bank":p.method==="شبكة"?"network":p.method==="قرة"?"qara":"tabby"}">${p.method}</span></div>`}
function openStudent(){studentModal.classList.add("show");sName.focus()}function closeStudent(){studentModal.classList.remove("show")}
function saveStudent(){let name=sName.value.trim(),level=sLevel.value,fees=Number(sFees.value);if(!name||!fees)return alert("أدخل اسم الطالب وإجمالي الرسوم");let d=db();d.students.push({id:crypto.randomUUID(),name,level,fees,notes:sNotes.value.trim(),createdAt:today()});saveDB(d);closeStudent();sName.value="";sFees.value="";sNotes.value="";renderStudents();alert("تم حفظ الطالب")}
function renderStudents(){if(!window.studentsTable)return;let d=db(),q=(studentSearch?.value||"").trim(),l=levelFilter?.value||"";studentsTable.innerHTML=d.students.filter(s=>(!q||s.name.includes(q))&&(!l||s.level===l)).map(s=>{let paid=d.payments.filter(p=>p.studentId===s.id).reduce((a,p)=>a+Number(p.amount),0);return `<tr><td><b>${s.name}</b></td><td>${s.level}</td><td>${money(s.fees)} ريال</td><td>${money(paid)} ريال</td><td>${money(Math.max(s.fees-paid,0))} ريال</td><td><a class="link" href="student.html?id=${s.id}">الملف</a></td></tr>`}).join("")||'<tr><td colspan="6">لا توجد نتائج</td></tr>'}
function initPayment(){pDate.value=today();let d=db();pStudent.innerHTML='<option value="">اختر الطالب</option>'+d.students.map(s=>`<option value="${s.id}">${s.name} — ${s.level}</option>`).join("")}
function showBalance(){let d=db(),s=d.students.find(x=>x.id===pStudent.value);if(!s)return balanceBox.textContent="اختر الطالب لمعرفة المتبقي";let paid=d.payments.filter(p=>p.studentId===s.id).reduce((a,p)=>a+Number(p.amount),0);balanceBox.textContent=`إجمالي الرسوم: ${money(s.fees)} ريال · المدفوع: ${money(paid)} ريال · المتبقي: ${money(Math.max(s.fees-paid,0))} ريال`}
function savePayment(){let d=db(),sid=pStudent.value,amount=Number(pAmount.value);if(!sid||!amount)return alert("اختر الطالب وأدخل المبلغ");let s=d.students.find(x=>x.id===sid),paid=d.payments.filter(p=>p.studentId===sid).reduce((a,p)=>a+Number(p.amount),0);if(amount>Math.max(s.fees-paid,0))return alert("المبلغ أكبر من المتبقي على الطالب");d.payments.push({id:crypto.randomUUID(),studentId:sid,date:pDate.value||today(),amount,method:pMethod.value,ref:pRef.value.trim(),notes:pNotes.value.trim()});saveDB(d);alert("تم حفظ الدفعة بنجاح");location.href="payments.html"}
function renderPayments(){if(!window.paymentsTable)return;let d=db(),q=(paySearch?.value||"").trim(),l=payLevel?.value||"",m=payMethod?.value||"",f=fromDate?.value||"",t=toDate?.value||"";paymentsTable.innerHTML=d.payments.slice().sort((a,b)=>b.date.localeCompare(a.date)).filter(p=>{let s=d.students.find(x=>x.id===p.studentId);return (!q||s?.name.includes(q))&&(!l||s?.level===l)&&(!m||p.method===m)&&(!f||p.date>=f)&&(!t||p.date<=t)}).map(p=>{let s=d.students.find(x=>x.id===p.studentId);return `<tr><td>${p.date}</td><td>${s?.name||"-"}</td><td>${s?.level||"-"}</td><td>${money(p.amount)} ريال</td><td>${p.method}</td><td>${p.ref||"-"}</td></tr>`}).join("")||'<tr><td colspan="6">لا توجد عمليات</td></tr>'}
function addDays(date,n){let d=new Date(date+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function weekday(date){return new Date(date+"T12:00:00").toLocaleDateString("ar-SA",{weekday:"long"})}
function nextWorkday(date){let d=date;for(let i=0;i<7;i++){let w=new Date(d+"T12:00:00").getDay();if(w!==5&&w!==6)return d;d=addDays(d,1)}}
function buildSchedule(d){let arr=[];d.students.forEach(s=>{let paid=d.payments.filter(p=>p.studentId===s.id).reduce((a,p)=>a+Number(p.amount),0),rem=s.fees-paid;if(rem<=0)return;let date=nextWorkday(addDays(today(),7));arr.push({name:s.name,level:s.level,date,day:weekday(date),amount:rem})});return arr.sort((a,b)=>a.date.localeCompare(b.date))}
function renderSchedule(){if(!window.scheduleTable)return;let d=db(),q=(schSearch?.value||"").trim(),l=schLevel?.value||"";scheduleTable.innerHTML=buildSchedule(d).filter(x=>(!q||x.name.includes(q))&&(!l||x.level===l)).map(x=>`<tr><td>${x.name}</td><td>${x.level}</td><td>${x.date}</td><td>${x.day}</td><td>${money(x.amount)} ريال</td></tr>`).join("")||'<tr><td colspan="5">لا توجد مواعيد</td></tr>'}
function renderReports(){let d=db(),fees=d.students.reduce((a,s)=>a+Number(s.fees),0),paid=d.payments.reduce((a,p)=>a+Number(p.amount),0);rStudents.textContent=money(d.students.length);rFees.textContent=money(fees);rPaid.textContent=money(paid);rRemain.textContent=money(Math.max(fees-paid,0));let methods=["بنكي","شبكة","قرة","تابي"];methodReport.innerHTML=methods.map(m=>{let x=d.payments.filter(p=>p.method===m);return `<tr><td>${m}</td><td>${x.length}</td><td>${money(x.reduce((a,p)=>a+Number(p.amount),0))} ريال</td></tr>`}).join("");levelReport.innerHTML=["تمهيدي","KG1","KG2"].map(l=>{let ss=d.students.filter(s=>s.level===l),ids=new Set(ss.map(s=>s.id)),pp=d.payments.filter(p=>ids.has(p.studentId)),f=ss.reduce((a,s)=>a+Number(s.fees),0),p=pp.reduce((a,x)=>a+Number(x.amount),0);return `<tr><td>${l}</td><td>${ss.length}</td><td>${money(f)}</td><td>${money(p)}</td><td>${money(Math.max(f-p,0))}</td></tr>`}).join("")}

const SETTINGS_KEY="ghaim_fee_settings_v1";
function settings(){try{return JSON.parse(localStorage.getItem(SETTINGS_KEY))||{levels:["تمهيدي","KG1","KG2"],methods:["بنكي","شبكة","قرة","تابي"]}}catch(e){return {levels:["تمهيدي","KG1","KG2"],methods:["بنكي","شبكة","قرة","تابي"]}}}
function saveSettings(x){localStorage.setItem(SETTINGS_KEY,JSON.stringify(x))}
function initStudentPage(){renderLevelOptions();renderStudents()}
function renderLevelOptions(){let x=settings().levels;if(window.levelFilter)levelFilter.innerHTML='<option value="">كل المستويات</option>'+x.map(v=>`<option>${v}</option>`).join("");if(window.sLevel)sLevel.innerHTML=x.map(v=>`<option>${v}</option>`).join("")}
function openStudent(id){studentModal.classList.add("show");let d=db(),s=d.students.find(x=>x.id===id);renderLevelOptions();if(s){studentModalTitle.textContent="تعديل بيانات الطالب";sId.value=s.id;sName.value=s.name;sLevel.value=s.level;sFees.value=s.fees;sNotes.value=s.notes||""}else{studentModalTitle.textContent="إضافة طالب";sId.value="";sName.value="";sFees.value="";sNotes.value=""}}
function closeStudent(){studentModal.classList.remove("show")}
function saveStudent(){let id=sId.value,name=sName.value.trim(),level=sLevel.value,fees=Number(sFees.value);if(!name||fees<0||!level)return alert("أكمل بيانات الطالب");let d=db();if(id){let s=d.students.find(x=>x.id===id);if(s){s.name=name;s.level=level;s.fees=fees;s.notes=sNotes.value.trim()}}else d.students.push({id:crypto.randomUUID(),name,level,fees,notes:sNotes.value.trim(),createdAt:today()});saveDB(d);closeStudent();renderStudents();alert(id?"تم تعديل بيانات الطالب":"تم حفظ الطالب")}
function deleteStudent(id){let d=db(),s=d.students.find(x=>x.id===id);if(!s)return;if(!confirm(`حذف الطالب "${s.name}"؟ سيتم حذف سجله المالي أيضًا.`))return;d.students=d.students.filter(x=>x.id!==id);d.payments=d.payments.filter(p=>p.studentId!==id);saveDB(d);renderStudents()}
function renderStudents(){if(!window.studentsTable)return;let d=db(),q=(studentSearch?.value||"").trim(),l=levelFilter?.value||"";studentsTable.innerHTML=d.students.filter(s=>(!q||s.name.includes(q))&&(!l||s.level===l)).map(s=>{let paid=d.payments.filter(p=>p.studentId===s.id).reduce((a,p)=>a+Number(p.amount),0);return `<tr><td><b>${s.name}</b></td><td>${s.level}</td><td>${money(s.fees)} ريال</td><td>${money(paid)} ريال</td><td>${money(Math.max(s.fees-paid,0))} ريال</td><td><a class="link" href="statement.html?id=${s.id}">كشف</a> · <button class="link" onclick="openStudent('${s.id}')">تعديل</button> · <button class="link danger" onclick="deleteStudent('${s.id}')">حذف</button></td></tr>`}).join("")||'<tr><td colspan="6">لا توجد نتائج</td></tr>'}
function initPayment(){pDate.value=today();let d=db(),m=settings().methods;pStudent.innerHTML='<option value="">اختر الطالب</option>'+d.students.map(s=>`<option value="${s.id}">${s.name} — ${s.level}</option>`).join("");pMethod.innerHTML=m.map(v=>`<option>${v}</option>`).join("")}
function renderSettings(){let x=settings();levelsList.innerHTML=x.levels.map((v,i)=>`<div class="setting-row"><b>${v}</b><span><button class="link" onclick="editLevel(${i})">تعديل</button> · <button class="link danger" onclick="deleteLevel(${i})">حذف</button></span></div>`).join("");methodsList.innerHTML=x.methods.map((v,i)=>`<div class="setting-row"><b>${v}</b><span><button class="link" onclick="editMethod(${i})">تعديل</button> · <button class="link danger" onclick="deleteMethod(${i})">حذف</button></span></div>`).join("")}
function addLevel(){let v=prompt("اسم المستوى الجديد:");if(!v?.trim())return;let x=settings();if(x.levels.includes(v.trim()))return alert("المستوى موجود");x.levels.push(v.trim());saveSettings(x);renderSettings()}
function editLevel(i){let x=settings(),v=prompt("تعديل اسم المستوى:",x.levels[i]);if(!v?.trim())return;let old=x.levels[i];x.levels[i]=v.trim();let d=db();d.students.forEach(s=>{if(s.level===old)s.level=x.levels[i]});saveDB(d);saveSettings(x);renderSettings()}
function deleteLevel(i){let x=settings(),name=x.levels[i],used=db().students.some(s=>s.level===name);if(used)return alert("لا يمكن حذف مستوى مستخدم من الطلاب. عدّل الطلاب أولاً.");if(!confirm("حذف المستوى؟"))return;x.levels.splice(i,1);saveSettings(x);renderSettings()}
function addMethod(){let v=prompt("اسم طريقة الدفع الجديدة:");if(!v?.trim())return;let x=settings();if(x.methods.includes(v.trim()))return alert("طريقة الدفع موجودة");x.methods.push(v.trim());saveSettings(x);renderSettings()}
function editMethod(i){let x=settings(),v=prompt("تعديل طريقة الدفع:",x.methods[i]);if(!v?.trim())return;let old=x.methods[i];x.methods[i]=v.trim();let d=db();d.payments.forEach(p=>{if(p.method===old)p.method=x.methods[i]});saveDB(d);saveSettings(x);renderSettings()}
function deleteMethod(i){let x=settings(),name=x.methods[i],used=db().payments.some(p=>p.method===name);if(used)return alert("لا يمكن حذف طريقة دفع مستخدمة في عمليات سابقة.");if(!confirm("حذف طريقة الدفع؟"))return;x.methods.splice(i,1);saveSettings(x);renderSettings()}
function renderStatement(){let id=new URLSearchParams(location.search).get("id"),d=db(),s=d.students.find(x=>x.id===id);if(!s){statementTitle.textContent="الطالب غير موجود";return}let ps=d.payments.filter(p=>p.studentId===id).sort((a,b)=>a.date.localeCompare(b.date)),paid=ps.reduce((a,p)=>a+Number(p.amount),0);statementTitle.textContent="كشف حساب — "+s.name;stName.textContent=s.name;stLevel.textContent=s.level;stFees.textContent=money(s.fees);stRemain.textContent=money(Math.max(s.fees-paid,0));statementTable.innerHTML=ps.map((p,i)=>`<tr><td>${i+1}</td><td>${p.date}</td><td>${money(p.amount)} ريال</td><td>${p.method}</td><td>${p.ref||"-"}</td><td>${p.notes||"-"}</td></tr>`).join("")||'<tr><td colspan="6">لا توجد دفعات مسجلة</td></tr>'}
function initFilters(){if(window.payLevel)payLevel.innerHTML='<option value="">كل المستويات</option>'+settings().levels.map(v=>`<option>${v}</option>`).join("");if(window.payMethod)payMethod.innerHTML='<option value="">كل طرق الدفع</option>'+settings().methods.map(v=>`<option>${v}</option>`).join("")}function initSchedule(){if(window.schLevel)schLevel.innerHTML='<option value="">كل المستويات</option>'+settings().levels.map(v=>`<option>${v}</option>`).join("")}
const AUTH_KEY="ghaim_auth_v1", CODE_KEY="ghaim_login_code_v1";
function loginCode(){return localStorage.getItem(CODE_KEY)||"1234"}
function isLoggedIn(){return sessionStorage.getItem(AUTH_KEY)==="1"}
function login(){let c=(document.getElementById("loginCode")?.value||"").trim();if(c===loginCode()){sessionStorage.setItem(AUTH_KEY,"1");location.href="index.html"}else{document.getElementById("loginError").textContent="كود الدخول غير صحيح";document.getElementById("loginError").classList.add("show")}}
function logout(){sessionStorage.removeItem(AUTH_KEY);location.href="login.html"}
function changeLoginCode(){let old=prompt("أدخل الكود الحالي:");if(old!==loginCode())return alert("الكود الحالي غير صحيح");let n=prompt("أدخل الكود الجديد (4 أرقام أو أكثر):");if(!n||n.length<4)return alert("الكود يجب أن يكون 4 أرقام أو أكثر");if(!/^\d+$/.test(n))return alert("استخدم أرقامًا فقط");localStorage.setItem(CODE_KEY,n);alert("تم تغيير كود الدخول")}
function protectPage(){if(!isLoggedIn())location.replace("login.html")}
if(!location.pathname.endsWith("/login.html")&&!location.pathname.endsWith("login.html"))protectPage();

function settings(){try{let x=JSON.parse(localStorage.getItem(SETTINGS_KEY));if(!x)x={levels:["تمهيدي","KG1","KG2","KG3"],methods:["بنكي","شبكة","قرة","تابي"]};if(!x.levels.includes("KG3"))x.levels.push("KG3");return x}catch(e){return {levels:["تمهيدي","KG1","KG2","KG3"],methods:["بنكي","شبكة","قرة","تابي"]}}}
function initStudentPage(){renderLevelOptions();sCreated.value=today();renderLevelCards();renderStudents()}
function renderLevelCards(){if(!window.levelCards)return;let d=db(),x=settings();levelCards.innerHTML=x.levels.map(l=>`<div class="level-card" onclick="levelFilter.value='${l}';renderStudents()"><small>عدد الأطفال</small><strong>${d.students.filter(s=>s.level===l).length}</strong><span>${l}</span></div>`).join("")}
function nextStudentNumber(){let n=db().students.map(s=>parseInt(s.number,10)).filter(Number.isFinite);return String((n.length?Math.max(...n):1000)+1)}
function openStudent(id){studentModal.classList.add("show");renderLevelOptions();let d=db(),s=d.students.find(x=>x.id===id);if(s){studentModalTitle.textContent="تعديل بيانات الطالب";sId.value=s.id;sNumber.value=s.number||"";sName.value=s.name;sLevel.value=s.level;sCreated.value=s.createdAt||today();sFees.value=s.fees;sNotes.value=s.notes||""}else{studentModalTitle.textContent="إضافة طالب";sId.value="";sNumber.value=nextStudentNumber();sName.value="";sCreated.value=today();sFees.value="";sNotes.value=""}}
function saveStudent(){let id=sId.value,name=sName.value.trim(),number=sNumber.value.trim(),level=sLevel.value,fees=Number(sFees.value),created=sCreated.value||today();if(!name||!number||!level||fees<0)return alert("أكمل بيانات الطالب");let d=db();if(id){let s=d.students.find(x=>x.id===id);Object.assign(s,{name,number,level,fees,createdAt:created,notes:sNotes.value.trim()})}else d.students.push({id:crypto.randomUUID(),number,name,level,fees,notes:sNotes.value.trim(),createdAt:created});saveDB(d);closeStudent();renderLevelCards();renderStudents();alert(id?"تم تعديل بيانات الطالب":"تم تسجيل الطالب بنجاح")}
function renderStudents(){if(!window.studentsTable)return;let d=db(),q=(studentSearch?.value||"").trim(),l=levelFilter?.value||"";studentsTable.innerHTML=d.students.filter(s=>(!q||s.name.includes(q)||String(s.number).includes(q))&&(!l||s.level===l)).map(s=>{let p=d.payments.filter(x=>x.studentId===s.id).reduce((a,x)=>a+Number(x.amount),0);return `<tr><td>${s.number||"-"}</td><td><b>${s.name}</b></td><td>${s.level}</td><td>${s.createdAt||"-"}</td><td>${money(s.fees)} ريال</td><td>${money(p)} ريال</td><td>${money(Math.max(s.fees-p,0))} ريال</td><td><a class="link" href="statement.html?id=${s.id}">كشف</a> · <button class="link" onclick="openStudent('${s.id}')">تعديل</button> · <button class="link danger" onclick="deleteStudent('${s.id}')">حذف</button></td></tr>`}).join("")||'<tr><td colspan="8">لا توجد نتائج</td></tr>'}
let currentReportPeriod="day";
function periodDates(p){let n=new Date(),s=new Date(n);if(p==="week")s.setDate(n.getDate()-n.getDay());if(p==="month")s=new Date(n.getFullYear(),n.getMonth(),1);return {start:s.toISOString().slice(0,10),end:n.toISOString().slice(0,10)}}
function setReportPeriod(p,b){currentReportPeriod=p;document.querySelectorAll(".report-tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderReports()}
function renderReports(){let d=db(),pd=periodDates(currentReportPeriod),fresh=d.students.filter(s=>(s.createdAt||"")>=pd.start&&(s.createdAt||"")<=pd.end),names={day:"اليومي",week:"الأسبوعي",month:"الشهري"},labs={day:"اليوم",week:"هذا الأسبوع",month:"هذا الشهر"};reportPeriodTitle.textContent="التقرير "+names[currentReportPeriod];oldCount.textContent=money(d.students.length-fresh.length);newCount.textContent=money(fresh.length);totalCount.textContent=money(d.students.length);newListTitle.textContent="الأطفال الجدد خلال "+labs[currentReportPeriod];newStudentsTable.innerHTML=fresh.map(s=>`<tr><td>${s.number||"-"}</td><td>${s.name}</td><td>${s.level}</td><td>${s.createdAt||"-"}</td><td>${money(s.fees)} ريال</td></tr>`).join("")||'<tr><td colspan="5">لا توجد تسجيلات جديدة</td></tr>';let x=settings();methodReport.innerHTML=x.methods.map(m=>{let p=d.payments.filter(v=>v.method===m&&v.date>=pd.start&&v.date<=pd.end);return `<tr><td>${m}</td><td>${p.length}</td><td>${money(p.reduce((a,v)=>a+Number(v.amount),0))} ريال</td></tr>`}).join("");levelReport.innerHTML=x.levels.map(l=>{let ss=d.students.filter(s=>s.level===l),ids=new Set(ss.map(s=>s.id)),pp=d.payments.filter(p=>ids.has(p.studentId)),f=ss.reduce((a,s)=>a+Number(s.fees),0),pay=pp.reduce((a,p)=>a+Number(p.amount),0);return `<tr><td>${l}</td><td>${ss.length}</td><td>${money(f)}</td><td>${money(pay)}</td><td>${money(Math.max(f-pay,0))}</td></tr>`}).join("")}

/* =====================================================
   Google Sheets Remote Sync
===================================================== */
let remoteLoading = false;

function normalizeRemoteData(raw) {
  const students = (raw.students || []).map(s => ({
    id: String(s.id || ""),
    number: String(s.number || ""),
    name: String(s.name || ""),
    level: String(s.level || ""),
    fees: Number(s.fees || 0),
    notes: String(s.notes || ""),
    createdAt: String(s.createdAt || "").slice(0,10),
    status: String(s.status || "active")
  })).filter(s => s.status !== "deleted");

  const payments = (raw.payments || []).map(p => ({
    id: String(p.id || ""),
    studentId: String(p.studentId || ""),
    date: String(p.date || "").slice(0,10),
    amount: Number(p.amount || 0),
    method: String(p.method || ""),
    ref: String(p.ref || ""),
    notes: String(p.notes || ""),
    createdAt: String(p.createdAt || "")
  }));

  const levels = (raw.levels || []).filter(x => String(x.status || "active") === "active").map(x => String(x.name || "")).filter(Boolean);
  const methods = (raw.methods || []).filter(x => String(x.status || "active") === "active").map(x => String(x.name || "")).filter(Boolean);

  return {
    students,
    payments,
    levels: levels.length ? levels : ["تمهيدي","KG1","KG2","KG3"],
    methods: methods.length ? methods : ["بنكي","شبكة","قرة","تابي"],
    settings: raw.settings || []
  };
}

function applyRemoteData(raw) {
  const x = normalizeRemoteData(raw);
  localStorage.setItem(DBKEY, JSON.stringify({students:x.students, payments:x.payments}));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({levels:x.levels, methods:x.methods}));
  return x;
}

async function refreshFromGoogle(showError=false) {
  if (remoteLoading) return false;
  remoteLoading = true;
  try {
    const data = await apiGet("getData");
    applyRemoteData(data);
    rerenderCurrentPage();
    return true;
  } catch (e) {
    console.error("Google Sheets sync:", e);
    if (showError) alert("تعذر الاتصال بقاعدة بيانات مركز غيم. تأكد من اتصال الإنترنت.");
    return false;
  } finally {
    remoteLoading = false;
  }
}

function rerenderCurrentPage() {
  try { if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") initDashboard(); } catch(e){}
  try { if (window.studentsTable) { renderLevelOptions(); renderLevelCards(); renderStudents(); } } catch(e){}
  try { if (window.pStudent) initPayment(); } catch(e){}
  try { if (window.paymentsTable) { initFilters(); renderPayments(); } } catch(e){}
  try { if (window.scheduleTable) { initSchedule(); renderSchedule(); } } catch(e){}
  try { if (window.levelsList) renderSettings(); } catch(e){}
  try { if (window.reportPeriodTitle) renderReports(); } catch(e){}
  try { if (window.statementTable) renderStatement(); } catch(e){}
}

/* Remote-aware student operations */
async function saveStudent() {
  const id=sId.value, name=sName.value.trim(), number=sNumber.value.trim(), level=sLevel.value;
  const fees=Number(sFees.value), created=sCreated.value||today();
  if(!name||!number||!level||fees<0) return alert("أكمل بيانات الطالب");
  try {
    const payload={id,number,name,level,fees,createdAt:created,notes:sNotes.value.trim(),status:"active"};
    await apiPost(id ? "updateStudent" : "addStudent", payload);
    await refreshFromGoogle();
    closeStudent();
    renderLevelCards(); renderStudents();
    alert(id ? "تم تعديل بيانات الطالب" : "تم تسجيل الطالب بنجاح");
  } catch(e) { alert(e.message); }
}

async function deleteStudent(id) {
  const d=db(), s=d.students.find(x=>x.id===id); if(!s)return;
  if(!confirm(`حذف الطالب "${s.name}"؟ سيتم حذف سجله المالي أيضًا.`))return;
  try { await apiPost("deleteStudent",{id}); await refreshFromGoogle(); renderLevelCards(); renderStudents(); }
  catch(e){ alert(e.message); }
}

async function savePayment() {
  const sid=pStudent.value, amount=Number(pAmount.value);
  if(!sid||!amount)return alert("اختر الطالب وأدخل المبلغ");
  try {
    await apiPost("addPayment",{studentId:sid,date:pDate.value||today(),amount,method:pMethod.value,ref:pRef.value.trim(),notes:pNotes.value.trim()});
    await refreshFromGoogle();
    alert("تم حفظ الدفعة بنجاح");
    location.href="payments.html";
  } catch(e){ alert(e.message); }
}

/* Remote-aware settings */
async function addLevel(){
  const v=prompt("اسم المستوى الجديد:"); if(!v?.trim())return;
  try { await apiPost("addLevel",{name:v.trim()}); await refreshFromGoogle(); renderSettings(); }
  catch(e){alert(e.message)}
}
async function editLevel(i){
  const x=settings(), v=prompt("تعديل اسم المستوى:",x.levels[i]); if(!v?.trim())return;
  /* Find server ID from the current remote dataset */
  try {
    const remote=await apiGet("getData");
    const item=(remote.levels||[]).find(z=>String(z.name)===String(x.levels[i]));
    if(!item) throw new Error("المستوى غير موجود في قاعدة البيانات");
    await apiPost("updateLevel",{id:item.id,name:v.trim(),status:"active"});
    await refreshFromGoogle(); renderSettings();
  } catch(e){alert(e.message)}
}
async function deleteLevel(i){
  const x=settings(), name=x.levels[i];
  if(db().students.some(s=>s.level===name))return alert("لا يمكن حذف مستوى مستخدم لدى أحد الطلاب");
  if(!confirm("حذف المستوى؟"))return;
  try { const remote=await apiGet("getData"); const item=(remote.levels||[]).find(z=>String(z.name)===name); if(!item)throw new Error("المستوى غير موجود"); await apiPost("deleteLevel",{id:item.id}); await refreshFromGoogle(); renderSettings(); }
  catch(e){alert(e.message)}
}
async function addMethod(){
  const v=prompt("اسم طريقة الدفع الجديدة:"); if(!v?.trim())return;
  try { await apiPost("addMethod",{name:v.trim()}); await refreshFromGoogle(); renderSettings(); }
  catch(e){alert(e.message)}
}
async function editMethod(i){
  const x=settings(), v=prompt("تعديل طريقة الدفع:",x.methods[i]); if(!v?.trim())return;
  try { const remote=await apiGet("getData"); const item=(remote.methods||[]).find(z=>String(z.name)===String(x.methods[i])); if(!item)throw new Error("طريقة الدفع غير موجودة"); await apiPost("updateMethod",{id:item.id,name:v.trim(),status:"active"}); await refreshFromGoogle(); renderSettings(); }
  catch(e){alert(e.message)}
}
async function deleteMethod(i){
  const x=settings(), name=x.methods[i];
  if(db().payments.some(p=>p.method===name))return alert("لا يمكن حذف طريقة دفع مستخدمة في عمليات سابقة");
  if(!confirm("حذف طريقة الدفع؟"))return;
  try { const remote=await apiGet("getData"); const item=(remote.methods||[]).find(z=>String(z.name)===name); if(!item)throw new Error("طريقة الدفع غير موجودة"); await apiPost("deleteMethod",{id:item.id}); await refreshFromGoogle(); renderSettings(); }
  catch(e){alert(e.message)}
}

/* Load Google data after the page's initial render */
window.addEventListener("load", () => {
  refreshFromGoogle(true);
});

/* =====================================================
   تحديث مركز غيم - رقم ولي الأمر + منع تكرار الضغط
===================================================== */

function buttonBusy(button, text = "جاري التنفيذ...") {
  if (!button || button.dataset.busy === "1") return false;
  button.dataset.busy = "1";
  button.dataset.originalText = button.innerHTML;
  button.disabled = true;
  button.classList.add("is-busy");
  button.innerHTML = `<span class="busy-spinner"></span>${text}`;
  return true;
}

function buttonReady(button) {
  if (!button) return;
  button.disabled = false;
  button.dataset.busy = "0";
  if (button.dataset.originalText !== undefined) {
    button.innerHTML = button.dataset.originalText;
  }
  button.classList.remove("is-busy");
}

function bindActionButtons() {
  document.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    if (button.dataset.noBusy === "1" || button.classList.contains("menu") || button.classList.contains("close")) return;
    if (button.dataset.busy === "1") {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

/* إضافة رقم ولي الأمر */
function getGuardianPhone() {
  return (document.getElementById("sGuardianPhone")?.value || "").trim();
}

function initStudentPage() {
  renderLevelOptions();
  if (window.sCreated) sCreated.value = today();
  renderLevelCards();
  renderStudents();
}

function openStudent(id) {
  studentModal.classList.add("show");
  renderLevelOptions();
  const d = db();
  const s = d.students.find(x => x.id === id);

  if (s) {
    studentModalTitle.textContent = "تعديل بيانات الطالب";
    sId.value = s.id;
    sNumber.value = s.number || "";
    sName.value = s.name || "";
    if (window.sGuardianPhone) sGuardianPhone.value = s.guardianPhone || "";
    sLevel.value = s.level || "";
    if (window.sCreated) sCreated.value = s.createdAt || today();
    sFees.value = s.fees || "";
    sNotes.value = s.notes || "";
  } else {
    studentModalTitle.textContent = "إضافة طالب";
    sId.value = "";
    sNumber.value = typeof nextStudentNumber === "function" ? nextStudentNumber() : "";
    sName.value = "";
    if (window.sGuardianPhone) sGuardianPhone.value = "";
    sCreated.value = today();
    sFees.value = "";
    sNotes.value = "";
  }
}

async function saveStudent(button) {
  button = button || document.querySelector("#studentModal .primary.wide");
  if (!buttonBusy(button, "جاري التسجيل...")) return;

  try {
    const id = sId.value;
    const name = sName.value.trim();
    const number = sNumber.value.trim();
    const guardianPhone = getGuardianPhone();
    const level = sLevel.value;
    const fees = Number(sFees.value);
    const created = sCreated.value || today();

    if (!name || !number || !level || fees < 0) {
      throw new Error("أكمل بيانات الطالب");
    }

    const d = db();

    if (id) {
      const s = d.students.find(x => x.id === id);
      if (!s) throw new Error("الطالب غير موجود");
      Object.assign(s, {
        name, number, guardianPhone, level, fees,
        createdAt: created,
        notes: sNotes.value.trim()
      });
    } else {
      d.students.push({
        id: crypto.randomUUID(),
        number,
        name,
        guardianPhone,
        level,
        fees,
        notes: sNotes.value.trim(),
        createdAt: created
      });
    }

    saveDB(d);
    closeStudent();
    renderLevelCards();
    renderStudents();

    alert(id ? "تم تعديل بيانات الطالب" : "تم تسجيل الطالب بنجاح");

  } catch (error) {
    alert(error.message || "حدث خطأ");
  } finally {
    buttonReady(button);
  }
}

function renderStudents() {
  if (!window.studentsTable) return;

  const d = db();
  const q = (studentSearch?.value || "").trim();
  const l = levelFilter?.value || "";

  studentsTable.innerHTML =
    d.students
      .filter(s =>
        (!q ||
          s.name.includes(q) ||
          String(s.number || "").includes(q) ||
          String(s.guardianPhone || "").includes(q)) &&
        (!l || s.level === l)
      )
      .map(s => {
        const paid = d.payments
          .filter(p => p.studentId === s.id)
          .reduce((a, p) => a + Number(p.amount), 0);

        return `
          <tr>
            <td>${s.number || "-"}</td>
            <td><b>${s.name}</b></td>
            <td>${s.guardianPhone || "-"}</td>
            <td>${s.level}</td>
            <td>${s.createdAt || "-"}</td>
            <td>${money(s.fees)} ريال</td>
            <td>${money(paid)} ريال</td>
            <td>${money(Math.max(s.fees - paid, 0))} ريال</td>
            <td>
              <a class="link" href="statement.html?id=${s.id}">كشف</a>
              · <button class="link" onclick="openStudent('${s.id}')">تعديل</button>
              · <button class="link danger" onclick="deleteStudent('${s.id}')">حذف</button>
            </td>
          </tr>`;
      })
      .join("") ||
    '<tr><td colspan="9">لا توجد نتائج</td></tr>';
}

function renderStatement() {
  const id = new URLSearchParams(location.search).get("id");
  const d = db();
  const s = d.students.find(x => x.id === id);

  if (!s) {
    if (window.statementTitle) statementTitle.textContent = "الطالب غير موجود";
    return;
  }

  const ps = d.payments
    .filter(p => p.studentId === id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const paid = ps.reduce((a, p) => a + Number(p.amount), 0);

  statementTitle.textContent = "كشف حساب — " + s.name;
  stName.textContent = s.name;
  if (window.stNumber) stNumber.textContent = s.number || "-";
  if (window.stGuardian) stGuardian.textContent = s.guardianPhone || "-";
  stLevel.textContent = s.level;
  stFees.textContent = money(s.fees);
  stRemain.textContent = money(Math.max(s.fees - paid, 0));

  statementTable.innerHTML =
    ps.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.date}</td>
        <td>${money(p.amount)} ريال</td>
        <td>${p.method}</td>
        <td>${p.ref || "-"}</td>
        <td>${p.notes || "-"}</td>
      </tr>
    `).join("") ||
    '<tr><td colspan="6">لا توجد دفعات مسجلة</td></tr>';
}

/* منع النقر المكرر على زر تسجيل الدفعة */
async function savePayment(button) {
  button = button || document.querySelector("#paymentForm .primary.wide, main .form-card .primary.wide");
  if (!buttonBusy(button, "جاري تسجيل الدفعة...")) return;

  try {
    const d = db();
    const sid = pStudent.value;
    const amount = Number(pAmount.value);

    if (!sid || !amount) {
      throw new Error("اختر الطالب وأدخل المبلغ");
    }

    const s = d.students.find(x => x.id === sid);
    const paid = d.payments
      .filter(p => p.studentId === sid)
      .reduce((a, p) => a + Number(p.amount), 0);

    if (amount > Math.max(s.fees - paid, 0)) {
      throw new Error("المبلغ أكبر من المتبقي على الطالب");
    }

    d.payments.push({
      id: crypto.randomUUID(),
      studentId: sid,
      date: pDate.value || today(),
      amount,
      method: pMethod.value,
      ref: pRef.value.trim(),
      notes: pNotes.value.trim()
    });

    saveDB(d);

    alert("تم تسجيل الدفعة بنجاح");
    location.href = "payments.html";

  } catch (error) {
    alert(error.message || "حدث خطأ");
    buttonReady(button);
  }
}

/* ربط حالة الضغط عند تحميل أي صفحة */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindActionButtons);
} else {
  bindActionButtons();
}

/* =====================================================
   FINAL GOOGLE SHEETS OPERATIONS
   آخر تعريفات الدوال - تمنع التخزين المحلي عند الحفظ
===================================================== */

async function saveStudent(button) {
  button = button || document.querySelector('#studentModal .primary.wide');
  if (!buttonBusy(button, 'جاري التسجيل...')) return;

  try {
    const id = (document.getElementById('sId')?.value || '').trim();
    const name = (document.getElementById('sName')?.value || '').trim();
    const number = (document.getElementById('sNumber')?.value || '').trim();
    const guardianPhone = (document.getElementById('sGuardianPhone')?.value || '').trim();
    const level = document.getElementById('sLevel')?.value || '';
    const fees = Number(document.getElementById('sFees')?.value || 0);
    const createdAt = document.getElementById('sCreated')?.value || today();
    const notes = (document.getElementById('sNotes')?.value || '').trim();

    if (!name || !number || !level || fees < 0) {
      throw new Error('أكمل بيانات الطالب');
    }

    const payload = {
      id: id,
      number: number,
      name: name,
      guardianPhone: guardianPhone,
      level: level,
      fees: fees,
      notes: notes,
      createdAt: createdAt,
      status: 'active'
    };

    const result = await apiPost(
      id ? 'updateStudent' : 'addStudent',
      payload
    );

    await refreshFromGoogle(true);
    closeStudent();
    renderLevelCards?.();
    renderStudents?.();

    alert(id ? 'تم تعديل بيانات الطالب بنجاح' : 'تم تسجيل الطالب بنجاح');

  } catch (error) {
    console.error(error);
    alert(error.message || 'تعذر حفظ بيانات الطالب');
  } finally {
    buttonReady(button);
  }
}

async function savePayment(button) {
  button = button || document.querySelector('#paymentForm .primary.wide, main .form-card .primary.wide');
  if (!buttonBusy(button, 'جاري تسجيل الدفعة...')) return;

  try {
    const studentId = document.getElementById('pStudent')?.value || '';
    const amount = Number(document.getElementById('pAmount')?.value || 0);
    const date = document.getElementById('pDate')?.value || today();
    const method = document.getElementById('pMethod')?.value || '';
    const ref = (document.getElementById('pRef')?.value || '').trim();
    const notes = (document.getElementById('pNotes')?.value || '').trim();

    if (!studentId || amount <= 0) {
      throw new Error('اختر الطالب وأدخل المبلغ');
    }

    await apiPost('addPayment', {
      studentId: studentId,
      date: date,
      amount: amount,
      method: method,
      ref: ref,
      notes: notes
    });

    await refreshFromGoogle(true);

    alert('تم تسجيل الدفعة بنجاح');
    location.href = 'payments.html';

  } catch (error) {
    console.error(error);
    alert(error.message || 'تعذر تسجيل الدفعة');
    buttonReady(button);
  }
}

async function deleteStudent(id, button) {
  const d = db();
  const student = d.students.find(x => String(x.id) === String(id));
  if (!student) return;

  if (!confirm(`حذف الطالب "${student.name}"؟ سيتم حذف سجله المالي أيضًا.`)) return;

  if (button && !buttonBusy(button, 'جاري الحذف...')) return;

  try {
    await apiPost('deleteStudent', { id: id });
    await refreshFromGoogle(true);
    renderLevelCards?.();
    renderStudents?.();
    alert('تم حذف الطالب بنجاح');
  } catch (error) {
    console.error(error);
    alert(error.message || 'تعذر حذف الطالب');
  } finally {
    buttonReady(button);
  }
}
