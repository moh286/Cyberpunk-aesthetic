const subForm = document.querySelector("#subForm");
const subName = document.querySelector("#subName");
const subPrice = document.querySelector("#subPrice");
const subCycle = document.querySelector("#subCycle");
const subList = document.querySelector("#subList");

const monthlyTotalElm = document.querySelector("#monthlyTotal");
const yearlyTotalElm = document.querySelector("#yearlyTotal");
const budgetInput = document.querySelector("#budgetInput");
const progressBar = document.querySelector("#progressBar");
const subCountElm = document.querySelector("#subCount");
const clearAllBtn = document.querySelector("#clearAllBtn");

let subscriptions = JSON.parse(localStorage.getItem("cyber_subs")) || [];
let budgetLimit = Number(localStorage.getItem("cyber_budget")) || 100;

budgetInput.value = budgetLimit;

// دالة عرض وتحديث البيانات بالـ DOM
function render() {
  // 1. تفريغ القائمة من العناصر القديمة
  subList.innerHTML = "";
  let totalMonthly = 0;
  // 2. تكرار على مصفوفة الاشتراكات لبناء العناصر
  subscriptions.forEach(function (sub) {
    // حساب التكلفة الشهرية لكل خدمة
    // إذا كان الاشتراك سنوياً بنقسمه على 12 ليعطينا حصة الشهر
    const monthlyPrice = sub.cycle === "yearly" ? sub.price / 12 : sub.price;
    totalMonthly += monthlyPrice;

    const li = document.createElement("li");
    li.className = "sub-item";

    // محتوى الكرت
    li.innerHTML = `
      <div class="sub-info">
        <strong>${sub.name}</strong>
        <span>${sub.cycle === "monthly" ? "دفع شهري" : "دفع سنوي"}</span>
      </div>
      <div>
        <span class="sub-price">$${sub.price.toFixed(2)}</span>
        <button class="del-btn" data-id="${sub.id}">✖</button>
      </div>
    `;

    // ربط حدث الحذف لزر الإلغاء داخل العنصر
    const delBtn = li.querySelector(".del-btn");
    delBtn.addEventListener("click", function () {
      deleteSub(sub.id);
    });
    subList.appendChild(li);
  });

  const totalYearly = totalMonthly * 12;
  monthlyTotalElm.textContent = `${totalMonthly.toFixed(2)}`;
  yearlyTotalElm.textContent = `${totalYearly.toFixed(2)}`;
  subCountElm.textContent = subscriptions.length;

  updateProgressBar(totalMonthly);
}

function deleteSub(id) {
  subscriptions = subscriptions.filter(function (sub) {
    return sub.id !== id;
  });
  // حفظ التعديل بالـ LocalStorage
  localStorage.setItem("cyber_subs", JSON.stringify(subscriptions));
  // إعادة رسم الشاشة
  render();
}

// أوجدنا الدالة لنغير عرض ولون الشريط حسب المبلغ المستهلك
function updateProgressBar(monthlySpent) {
  if (budgetLimit <= 0) return;

  // - percentage: نسبة المئوية للمستهلك (المبلغ المستهلك / الميزانية * 100)
  let percentage = (monthlySpent / budgetLimit) * 100;

  // تحكُم بعرض الشريط بالـ CSS
  progressBar.style.width = `${Math.min(percentage, 100)}%`;

  // تغيير اللون للأحمر إذا تجاوزت الميزانية الـ 100%
  if (percentage > 100) {
    progressBar.style.backgroundColor = "var(--danger-color)";
  } else {
    progressBar.style.backgroundColor = "var(--neon-cyan)";
  }
}

subForm.addEventListener("submit", function (e) {
  e.preventDefault(); //منع اعادة تحميل صفحة

  const newSub = {
    id: Date.now(),
    name: subName.value.trim(),
    price: Number(subPrice.value),
    cycle: subCycle.value,
  };
  subscriptions.push(newSub);
  localStorage.setItem("cyber_subs", JSON.stringify(subscriptions));
  subName.value = "";
  subPrice.value = "";
  // إعادة رسم الشاشة لإظهار العنصر الجديد فوراً
  render();
  //   console.log("تم إضافة الاشتراك بنجاح:", subscriptions);
});
// ب) حدث تغيير حقل الميزانية
budgetInput.addEventListener("input", function () {
  // قراءة الرقم الجديد وتخزينه في budgetLimit
  budgetLimit = Number(budgetInput.value) || 0;
  // حفظ الميزانية بالـ localStorage
  localStorage.setItem("cyber_budget", budgetLimit);
  // إعادة الرسم لتحديث شريط الميزانية
  render();
});
// ج) حدث زر مسح جميع الاشتراكات
clearAllBtn.addEventListener("click", function () {
  if (subscriptions.length === 0) return;
  // تفريغ المصفوفة
  subscriptions = [];
  // حذف الرف الخاص بالاشتراكات من الـ localStorage
  localStorage.removeItem("cyber_subs");
  // إعادة رسم الشاشة (رح ترسم شاشة فاضية)
  render();
});
// 7. تشغيل الدالة لأول مرة عند فتح الصفحة
render();
