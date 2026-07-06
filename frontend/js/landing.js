const pairs = [
  ['Python', 'Pottery'], ['Spanish', 'Guitar'], ['React', 'Yoga'],
  ['Figma', 'Mandarin'], ['Copywriting', 'Chess'], ['Photography', 'Excel'],
  ['Piano', 'SQL'], ['French', 'Illustration'], ['Public Speaking', 'Baking']
];
 
const track = document.getElementById('marquee');
 
const renderPills = () => pairs.map(([a, b]) => `
  <span class="pair-pill">
    <span class="dot teach"></span>${a}
    <span class="arrow">&#8646;</span>
    <span class="dot learn"></span>${b}
  </span>
`).join('');
 
// duplicated content makes the scroll loop seamless
if (track) {
  track.innerHTML = renderPills() + renderPills();
}
 