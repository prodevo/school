const prices = [150, 0, 45, 320, 0, 85];
const banknotes = [500, 200, 100, 50, 20, 10, 5, 2, 1];

let total = 0;
let discount = 0;
let finalTotal = 0;
let payment = 0;

window.addEventListener("DOMContentLoaded", () => {
    const cartChips = document.getElementById("cartChips");
    if (cartChips) {
        cartChips.innerHTML = prices
            .map((price, idx) => `
                <span class="px-3 py-1 ${price === 0 ? 'bg-slate-200 text-slate-500 line-through' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'} rounded-lg text-xs font-semibold">
                    Товар ${idx + 1}: ${price} грн
                </span>
            `)
            .join("");
    }
});

function calculateCart() {
    total = 0;
    const receiptItems = document.getElementById("receiptItems");
    if (receiptItems) receiptItems.innerHTML = "";

    for (let i = 0; i < prices.length; i++) {
        if (prices[i] === 0) {
            continue;
        }

        const itemWithVat = prices[i] * 1.2;
        total += itemWithVat;

        if (receiptItems) {
            receiptItems.innerHTML += `
                <div class="flex justify-between">
                    <span>Товар ${i + 1} (${prices[i]} грн + 20% ПДВ):</span>
                    <span>${itemWithVat.toFixed(2)} грн</span>
                </div>
            `;
        }
    }

    total = Number(total.toFixed(2));
    finalTotal = total;

    console.log("Сума чека з ПДВ:", total, "грн");

    document.getElementById("receiptRawTotal").textContent = `${total.toFixed(2)} грн`;
    document.getElementById("receiptToPay").textContent = `${finalTotal.toFixed(2)} грн`;

    validatePromoCode();

    document.getElementById("btnApplyBonuses").disabled = false;
}

function validatePromoCode() {
    const promoCode = prompt("Введіть промокод (наприклад: SALE-2024-UA):");
    if (!promoCode) return;

    let digits = 0;
    let letters = 0;
    let valid = true;

    for (const char of promoCode) {
        if (char === "-") {
            continue;
        }

        if (char >= "0" && char <= "9") {
            digits++;
        } else if ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z")) {
            letters++;
        } else {
            valid = false;
            break;
        }
    }

    if (valid) {
        console.log("Промокод правильний");
        console.log("Кількість цифр: ", digits);
        console.log("Кількість латинських літер: ", letters);
        alert(`Промокод правильний!\nКількість цифр: ${digits}\nКількість латинських літер: ${letters}`);
    } else {
        console.log("Помилка зчитування промокоду!");
        alert("Помилка зчитування промокоду!");
    }
}

function applyBonuses() {
    let balance = Number(document.getElementById("bonusBalanceInput").value) || 310;
    discount = 0;
    const step = 50;
    const maxDiscount = total * 0.5;

    const bonusContainer = document.getElementById("bonusStepsContainer");
    bonusContainer.innerHTML = "";
    bonusContainer.classList.remove("hidden");

    while (balance >= step && discount + step <= maxDiscount) {
        balance -= step;
        discount += step;

        bonusContainer.innerHTML += `
            <div>Списано ${step} балів | Знижка: ${discount} грн | Залишок: ${balance} балів</div>
        `;
    }

    finalTotal = Number((total - discount).toFixed(2));

    console.log("Сума до сплати:", finalTotal, "грн");

    document.getElementById("bonusBalanceInput").value = balance;
    document.getElementById("receiptDiscount").textContent = `-${discount.toFixed(2)} грн`;
    document.getElementById("receiptToPay").textContent = `${finalTotal.toFixed(2)} грн`;

    document.getElementById("btnValidateCash").disabled = false;
}

function validateCashInput() {
    let paymentInput;
    let validPayment;

    do {
        paymentInput = document.getElementById("cashInput").value;

        if (!paymentInput || Number(paymentInput) < finalTotal) {
            paymentInput = prompt(`До сплати ${finalTotal} грн. Введіть суму готівки:`);
            if (paymentInput === null) return;
            document.getElementById("cashInput").value = paymentInput;
        }

        const amount = Number(paymentInput);

        validPayment =
            paymentInput !== null &&
            paymentInput.trim() !== "" &&
            Number.isFinite(amount) &&
            amount >= finalTotal &&
            amount >= 0;

        if (validPayment) {
            payment = amount;
        } else {
            alert("Помилка! Введіть коректну суму, не меншу за чек.");
            document.getElementById("cashInput").value = "";
        }
    } while (!validPayment);

    console.log("Отримано готівки:", payment, "грн");

    document.getElementById("validationMsg").textContent = `Отримано: ${payment} грн. Сума достатня!`;
    document.getElementById("receiptCash").textContent = `${payment.toFixed(2)} грн`;

    // Дозволити видачу решти
    document.getElementById("btnCalculateChange").disabled = false;
}

function calculateChange() {
    let change = Number((payment - finalTotal).toFixed(2));

    console.log("Видача решти:", change, "грн");
    document.getElementById("receiptChange").textContent = `${change.toFixed(2)} грн`;

    const banknotesResult = document.getElementById("banknotesResult");
    banknotesResult.innerHTML = "";

    let i = 0;

    while (i < banknotes.length) {
        const note = banknotes[i];
        const count = Math.floor(change / note);

        if (count > 0) {
            console.log(`Купюр номіналом ${note} грн: ${count} шт.`);

            banknotesResult.innerHTML += `
                <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                    <div class="text-xs text-purple-600 font-bold uppercase">${note} грн</div>
                    <div class="text-lg font-black text-purple-900">${count} шт.</div>
                </div>
            `;

            change = Number((change % note).toFixed(2));
        }

        i++;
    }

    console.log("Обслуговування завершено!");
}

function resetAll() {
    total = 0;
    discount = 0;
    finalTotal = 0;
    payment = 0;

    document.getElementById("bonusBalanceInput").value = "310";
    document.getElementById("cashInput").value = "";
    document.getElementById("validationMsg").textContent = "";

    document.getElementById("receiptItems").innerHTML = `<p class="text-slate-400 italic">Натисніть "Розрахувати кошик"...</p>`;
    document.getElementById("receiptRawTotal").textContent = "0.00 грн";
    document.getElementById("receiptDiscount").textContent = "-0.00 грн";
    document.getElementById("receiptToPay").textContent = "0.00 грн";
    document.getElementById("receiptCash").textContent = "0.00 грн";
    document.getElementById("receiptChange").textContent = "0.00 грн";

    const bonusContainer = document.getElementById("bonusStepsContainer");
    bonusContainer.innerHTML = "";
    bonusContainer.classList.add("hidden");

    document.getElementById("banknotesResult").innerHTML = "";

    document.getElementById("btnApplyBonuses").disabled = true;
    document.getElementById("btnValidateCash").disabled = true;
    document.getElementById("btnCalculateChange").disabled = true;

    console.clear();
    console.log("Касовий термінал скинуто.");
}
