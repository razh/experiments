// https://antimatter15.com/2015/05/cooley-tukey-fft-dct-idct-in-under-1k-of-javascript/

/* exported fft */
function fft(re, im) {
  'use strict';

  const N = re.length;
  for (let i = 0; i < N; i++) {
    let j;
    let h;
    let k;

    for (j = 0, h = i, k = N; (k >>= 1); h >>= 1) {
      j = (j << 1) | (h & 1);
    }

    if (j > i) {
      [re[j], re[i]] = [re[i], re[j]];
      [im[j], im[i]] = [im[i], im[j]];
    }
  }

  for (let hN = 1; hN * 2 <= N; hN *= 2) {
    for (let i = 0; i < N; i += hN * 2) {
      for (let j = i; j < i + hN; j++) {
        const cos = Math.cos(Math.PI * (j - i) / hN);
        const sin = Math.sin(Math.PI * (j - i) / hN);

        const tre = (re[j + hN] * cos) + (im[j + hN] * sin);
        const tim = (-re[j + hN] * sin) + (im[j + hN] * cos);

        re[j + hN] = re[j] - tre;
        im[j + hN] = im[j] - tim;
        re[j] += tre;
        im[j] += tim;
      }
    }
  }
}

/* exported ifft */
function ifft(re, im) {
  'use strict';

  fft(im, re);

  const N = re.length;
  for (let i = 0; i < re.length; i++) {
    im[i] /= N;
    re[i] /= N;
  }
}
