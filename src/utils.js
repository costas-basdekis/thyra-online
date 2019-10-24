export const copyToClipboard = text => {
  const textArea = document.createElement("textarea");
  // This won't work
  // textArea.style.display = 'none'
  document.body.appendChild(textArea);
  textArea.value = text;
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};
