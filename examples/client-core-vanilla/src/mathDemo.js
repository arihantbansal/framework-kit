import { lamportsMath, pow10, toBigint } from '@solana/client-core';

import { showError } from './ui.js';

/**
 * Hooks numeric helper utilities into the math playground form.
 *
 * @param {object} params - Wiring configuration.
 * @param {HTMLFormElement} params.form - Form element.
 * @param {HTMLInputElement} params.exponentInput - pow10 exponent field.
 * @param {HTMLInputElement} params.integerInput - Integer parsing field.
 * @param {HTMLInputElement} params.solInput - SOL field for lamport conversion.
 * @param {HTMLInputElement} params.lamportsInput - Lamports field for SOL conversion.
 * @param {HTMLElement} params.outputElement - Output element.
 */
export function setupMathDemo({ form, exponentInput, integerInput, solInput, lamportsInput, outputElement }) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const messages = [];

        try {
            const exponentValue = exponentInput.value === '' ? null : Number(exponentInput.value);
            if (exponentValue !== null && !Number.isNaN(exponentValue)) {
                const result = pow10(exponentValue);
                messages.push(`pow10(${exponentValue}) = ${result.toString()}`);
            }

            const integerRaw = String(integerInput.value ?? '').trim();
            if (integerRaw) {
                const parsed = toBigint(integerRaw, 'integer input');
                messages.push(`toBigint("${integerRaw}") = ${parsed.toString()}`);
            }

            const solRaw = String(solInput.value ?? '').trim();
            if (solRaw) {
                const lamports = lamportsMath.fromSol(solRaw, { label: 'SOL input' });
                messages.push(`${solRaw} SOL → ${lamports.toString()} lamports`);
            }

            const lamportsRaw = String(lamportsInput.value ?? '').trim();
            if (lamportsRaw) {
                const lamportsBigint = lamportsMath.fromLamports(lamportsRaw, 'lamports input');
                const solString = lamportsMath.toSolString(lamportsBigint);
                messages.push(`${lamportsRaw} lamports → ${solString} SOL`);
            }

            if (messages.length === 0) {
                outputElement.textContent = 'Provide at least one input to run the demo.';
            } else {
                outputElement.textContent = messages.join('\n');
            }
        } catch (error) {
            showError(outputElement, error);
        }
    });
}
