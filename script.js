document.addEventListener('DOMContentLoaded', () => {
    const hanziContainer = document.getElementById('hanziContainer');
    const tooltip = document.getElementById('tooltip');
    const fileInput = document.getElementById('csvFileInput');
    const hanziInput = document.getElementById('hanziInput');
    const generateButton = document.getElementById('generateButton');

    let hanziData = []; 

    function addTooltipListeners() {
        const hanziElements = document.querySelectorAll('.hanzi');

        hanziElements.forEach(hanzi => {
            hanzi.addEventListener('mouseover', (event) => {
                let targetElement = event.target;

                if (!targetElement.getAttribute('data-pinyin')) {
                    targetElement = targetElement.closest('.hanzi'); 
                }

                const pinyin = targetElement.getAttribute('data-pinyin');
                const definition = targetElement.getAttribute('data-definition');
                const hskLevel = targetElement.getAttribute('data-hsk-level');
                tooltip.innerHTML = `<strong>Pinyin:</strong> ${pinyin}<br><strong>Definition:</strong> ${definition}<br><strong>HSK Level:</strong> ${hskLevel}`;

                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
                tooltip.style.opacity = 1;
            });

            hanzi.addEventListener('mousemove', (event) => {
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
            });

            hanzi.addEventListener('mouseout', () => {
                tooltip.style.opacity = 0;
            });
        });
    }

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: function (results) {
                    hanziData = results.data; 
                    console.log('Parsed CSV data:', hanziData);
                },
                error: function (error) {
                    console.error('Error parsing CSV:', error);
                }
            });
        }
    });

    generateButton.addEventListener('click', () => {
        const text = hanziInput.value;
        const hanziArray = [];

        console.log(hanziData);
        text.split('').forEach(char => {
            if (isChinese(char)) {
                const entry = hanziData.find(item => item.character === char);
                if (entry) {
                    hanziArray.push(entry);
                } else {
                    hanziArray.push({
                        character: char,
                        pinyin: 'Unknown',
                        definition: 'Definition not found',
                        hsk_level: 'N/A'
                    });
                }
            } else {
                hanziArray.push({
                    character: char,
                    pinyin: '',
                    definition: '',
                    hsk_level: '',
                    isNonChinese: true
                });
            }
        });

        console.log(hanziArray);

        generateHanziText(hanziArray); 
    });

    function createHanziSpan(hanzi, pinyin, definition, hskLevel, isNonChinese = false) {
        const span = document.createElement('span');
        span.classList.add('hanzi');
        span.textContent = hanzi;
        span.setAttribute('data-pinyin', pinyin);
        span.setAttribute('data-definition', definition);
        span.setAttribute('data-hsk-level', hskLevel);

        if (pinyin) {
            const pinyinElement = document.createElement('span');
            pinyinElement.classList.add('pinyin-text');
            pinyinElement.textContent = pinyin;
            span.appendChild(pinyinElement);
        }

        return span;
    }

    document.getElementById('showPinyin').addEventListener('change', () => {
        const showPinyin = document.getElementById('showPinyin').checked;
        const pinyinElements = document.querySelectorAll('.pinyin-text');
        pinyinElements.forEach(pinyinElement => {
            pinyinElement.style.display = showPinyin ? 'block' : 'none';
        });
    });

    function generateHanziText(hanziArray) {
        hanziContainer.innerHTML = '';
        hanziArray.forEach(item => {
            if (item.character && !item.isNonChinese) {
                const span = createHanziSpan(
                    item.character,
                    item.pinyin,
                    item.definition,
                    item.hsk_level,
                    item.isNonChinese
                );
                hanziContainer.appendChild(span);
            } else if (item.character) {
                const textNode = document.createElement('span');
                textNode.classList.add('non-chinese');
                textNode.textContent = item.character;
                hanziContainer.appendChild(textNode);
            } else {
                console.warn('Missing character, pinyin, or definition:', item); 
            }
        });
        addTooltipListeners(); 
        togglePinyinVisibility();
    }

    function isChinese(char) {
        // Chinese characters are generally in the Unicode range \u4E00 to \u9FFF
        return /[\u4E00-\u9FFF]/.test(char);
    }
});
