export function wireOtpInputs(container: HTMLElement): HTMLInputElement[] {
  const inputs = Array.from(
    container.querySelectorAll<HTMLInputElement>('[data-otp-digit]')
  );

  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      const val = input.value.replace(/\D/g, '');
      input.value = val.slice(-1);

      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, inputs.length);
      pasted.split('').forEach((char, i) => {
        if (inputs[i]) inputs[i].value = char;
      });
      const focusIndex = Math.min(pasted.length, inputs.length - 1);
      inputs[focusIndex]?.focus();
    });
  });

  return inputs;
}

export function getOtpValue(inputs: HTMLInputElement[]): string {
  return inputs.map((i) => i.value).join('');
}

export function clearOtpInputs(inputs: HTMLInputElement[]): void {
  inputs.forEach((i) => {
    i.value = '';
  });
  inputs[0]?.focus();
}
