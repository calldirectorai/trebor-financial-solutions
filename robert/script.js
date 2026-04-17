const vcard = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Avege;Robert;;;',
  'FN:Robert Avege',
  'ORG:Trebor Financial Solutions',
  'TITLE:Founder & Financial Strategist',
  'TEL;TYPE=CELL,VOICE:+17475297880',
  'EMAIL;TYPE=INTERNET,PREF:robert@treborfinancialsolutions.com',
  'URL:https://www.treborfinancialsolutions.com',
  'ADR;TYPE=WORK:;;Los Angeles;CA;;USA',
  'NOTE:Tax preparation, credit repair, financial coaching, and bookkeeping. Serving clients nationwide.',
  'END:VCARD'
].join('\r\n');

function saveContact() {
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Robert-Avege-Trebor-Financial.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}