/* ==========================================================================
   HEMMA SAPPHIRE - 灝然 互動檢視引擎 (Traditional Chinese Version)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Application State
    let allFlats = [];
    let filteredFlats = [];
    
    // DOM Elements - Sizing Filters
    const sizePresetBtns = document.querySelectorAll('#size-filter-card .preset-btn');
    const minSizeInput = document.getElementById('min-size');
    const maxSizeInput = document.getElementById('max-size');
    const resetSizeBtn = document.getElementById('reset-size-btn');
    
    // DOM Elements - Price Filters
    const pricePresetBtns = document.querySelectorAll('#price-filter-card .preset-btn');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const resetPriceBtn = document.getElementById('reset-price-btn');
    
    // DOM Elements - Estate Selector
    const estateSelect = document.getElementById('estate-select');
    
    // DOM Elements - Dropdown Selectors
    const blockSelect = document.getElementById('block-select');
    const floorSelect = document.getElementById('floor-select');
    const flatSelect = document.getElementById('flat-select');
    const matchBadge = document.getElementById('match-badge');
    
    // DOM Elements - Map Controls
    const mapMarker = document.getElementById('map-marker');
    const mapHint = document.getElementById('map-hint');
    const mapWrapper = document.querySelector('.map-wrapper');
    const mapInner = document.getElementById('map-inner');
    const mapImage = document.getElementById('map-image');

    // Center coordinates (X, Y) of each building block for zooming
    const BLOCK_CENTERS = {
        "第1A座 Tower 1A": { x: 15.0, y: 66.0 },
        "第1B座 Tower 1B": { x: 26.0, y: 68.0 },
        "第2A座 Tower 2A": { x: 11.0, y: 43.0 },
        "第2B座 Tower 2B": { x: 20.0, y: 33.0 },
        "第3A座 Tower 3A": { x: 35.0, y: 25.0 },
        "第3B座 Tower 3B": { x: 47.0, y: 25.0 },
        "第4A座 Tower 4A": { x: 64.0, y: 41.0 },
        "第4B座 Tower 4B": { x: 74.0, y: 61.0 },
        "第5A座 Tower 5A": { x: 55.0, y: 70.0 },
        "第5B座 Tower 5B": { x: 65.0, y: 71.0 }
    };

    // Percentage coordinates (X, Y) of each flat on the master plan image
    const FLAT_COORDINATES = {
        "第1A座 Tower 1A": {
            "A": { x: 17.4, y: 58.2 },
            "B": { x: 17.0, y: 54.5 },
            "C": { x: 13.7, y: 54.8 },
            "D": { x: 14.3, y: 59.7 },
            "E": { x: 14.8, y: 64.6 },
            "F": { x: 13.2, y: 72.2 },
            "H": { x: 12.2, y: 78.2 },
            "J": { x: 17.2, y: 75.6 },
            "K": { x: 15.5, y: 77.2 }
        },
        "第1B座 Tower 1B": {
            "A": { x: 20.0, y: 65.2 },
            "B": { x: 20.5, y: 61.2 },
            "C": { x: 21.6, y: 71.2 },
            "D": { x: 22.6, y: 70.3 },
            "E": { x: 26.0, y: 69.5 },
            "F": { x: 29.5, y: 68.5 },
            "G": { x: 31.2, y: 67.8 },
            "H": { x: 28.5, y: 62.8 },
            "J": { x: 26.2, y: 63.5 }
        },
        "第2A座 Tower 2A": {
            "A": { x: 11.5, y: 38.5 },
            "D": { x: 9.2, y: 48.2 },
            "E": { x: 11.3, y: 48.2 },
            "F": { x: 13.0, y: 38.7 }
        },
        "第2B座 Tower 2B": {
            "A": { x: 24.5, y: 35.0 },
            "B": { x: 23.3, y: 33.3 },
            "C": { x: 22.1, y: 31.2 },
            "F": { x: 17.5, y: 34.3 },
            "G": { x: 18.5, y: 36.0 },
            "H": { x: 19.7, y: 38.0 }
        },
        "第3A座 Tower 3A": {
            "A": { x: 39.5, y: 31.2 },
            "B": { x: 39.0, y: 20.0 },
            "C": { x: 36.8, y: 20.3 },
            "D": { x: 34.5, y: 21.0 },
            "E": { x: 31.3, y: 23.5 },
            "G": { x: 35.5, y: 29.8 }
        },
        "第3B座 Tower 3B": {
            "A": { x: 50.2, y: 31.2 },
            "B": { x: 48.5, y: 30.0 },
            "C": { x: 51.6, y: 23.8 },
            "D": { x: 48.0, y: 21.5 },
            "E": { x: 44.6, y: 20.0 },
            "F": { x: 43.0, y: 20.3 },
            "G": { x: 42.8, y: 28.8 },
            "H": { x: 45.2, y: 29.5 }
        },
        "第4A座 Tower 4A": {
            "A": { x: 66.8, y: 42.2 },
            "D": { x: 59.6, y: 37.5 },
            "E": { x: 61.2, y: 41.2 },
            "F": { x: 64.0, y: 48.2 },
            "G": { x: 66.0, y: 51.5 },
            "H": { x: 67.8, y: 48.2 }
        },
        "第4B座 Tower 4B": {
            "A": { x: 76.3, y: 65.8 },
            "B": { x: 75.0, y: 67.2 },
            "C": { x: 79.2, y: 70.8 },
            "D": { x: 80.8, y: 67.8 },
            "F": { x: 76.8, y: 57.5 },
            "G": { x: 72.2, y: 54.5 },
            "H": { x: 71.5, y: 51.5 },
            "J": { x: 70.2, y: 61.0 },
            "K": { x: 71.8, y: 63.5 }
        },
        "第5A座 Tower 5A": {
            "A": { x: 55.0, y: 65.2 },
            "B": { x: 52.5, y: 64.0 },
            "C": { x: 50.2, y: 62.8 },
            "D": { x: 52.2, y: 70.0 },
            "E": { x: 54.0, y: 71.2 },
            "F": { x: 59.5, y: 75.6 },
            "G": { x: 60.5, y: 70.0 },
            "H": { x: 58.2, y: 68.8 }
        },
        "第5B座 Tower 5B": {
            "A": { x: 66.8, y: 70.0 },
            "B": { x: 67.8, y: 66.0 },
            "C": { x: 64.6, y: 63.8 },
            "D": { x: 63.5, y: 60.8 },
            "E": { x: 62.8, y: 78.2 },
            "F": { x: 64.0, y: 81.2 },
            "G": { x: 64.8, y: 78.2 }
        }
    };
    
    // DOM Elements - Details View
    const emptyState = document.getElementById('empty-state');
    const detailsContent = document.getElementById('details-content');
    const detailBlockBadge = document.getElementById('detail-block-badge');
    const detailFloor = document.getElementById('detail-floor');
    const detailFlat = document.getElementById('detail-flat');
    const detailPrice = document.getElementById('detail-price');
    const detailSizeFt = document.getElementById('detail-size-ft');
    const detailSizeM = document.getElementById('detail-size-m');
    const detailRateFt = document.getElementById('detail-rate-ft');
    const detailRateM = document.getElementById('detail-rate-m');
    const detailBalcony = document.getElementById('detail-balcony');
    const detailUtility = document.getElementById('detail-utility');
    const featureBalconyContainer = document.getElementById('feature-balcony-container');
    const featureUtilityContainer = document.getElementById('feature-utility-container');

    // ==========================================================================
    // 1. Data Initialization & Multi-Estate Management
    // ==========================================================================
    function initWithData(data) {
        try {
            allFlats = data;
            filteredFlats = [...allFlats];
            blockSelect.removeAttribute('disabled');
            applyFiltersAndRebuildDropdowns();
            
            console.log(`Loaded ${allFlats.length} flats successfully.`);
        } catch (error) {
            console.error('Initialization error:', error);
            blockSelect.innerHTML = `<option value="">加載數據失敗：數據格式不正確</option>`;
        }
    }

    function init() {
        if (typeof allFlatsData !== 'undefined') {
            initWithData(allFlatsData);
        } else {
            console.warn("allFlatsData is undefined. Waiting for script to load...");
            blockSelect.innerHTML = `<option value="">正在載入項目數據...</option>`;
        }
    }

    // ==========================================================================
    // 2. Interactive Filtering Logic
    // ==========================================================================
    
    // --- Sizing Filters ---
    sizePresetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sizePresetBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const preset = e.target.dataset.preset;
            
            if (preset === 'all') {
                minSizeInput.value = '';
                maxSizeInput.value = '';
            } else if (preset === 'small') {
                minSizeInput.value = '';
                maxSizeInput.value = '349';
            } else if (preset === 'medium') {
                minSizeInput.value = '350';
                maxSizeInput.value = '450';
            } else if (preset === 'large') {
                minSizeInput.value = '451';
                maxSizeInput.value = '';
            }
            
            applyFiltersAndRebuildDropdowns();
        });
    });

    const onSizeRangeInput = () => {
        sizePresetBtns.forEach(btn => btn.classList.remove('active'));
        
        const minVal = minSizeInput.value;
        const maxVal = maxSizeInput.value;
        
        if (minVal === '' && maxVal === '') {
            document.querySelector('#size-filter-card [data-preset="all"]').classList.add('active');
        } else if (minVal === '' && maxVal === '349') {
            document.querySelector('#size-filter-card [data-preset="small"]').classList.add('active');
        } else if (minVal === '350' && maxVal === '450') {
            document.querySelector('#size-filter-card [data-preset="medium"]').classList.add('active');
        } else if (minVal === '451' && maxVal === '') {
            document.querySelector('#size-filter-card [data-preset="large"]').classList.add('active');
        }
        
        applyFiltersAndRebuildDropdowns();
    };

    minSizeInput.addEventListener('input', onSizeRangeInput);
    maxSizeInput.addEventListener('input', onSizeRangeInput);

    resetSizeBtn.addEventListener('click', () => {
        minSizeInput.value = '';
        maxSizeInput.value = '';
        sizePresetBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector('#size-filter-card [data-preset="all"]').classList.add('active');
        applyFiltersAndRebuildDropdowns();
    });

    // --- Price Filters ---
    pricePresetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            pricePresetBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const preset = e.target.dataset.pricePreset;
            
            if (preset === 'all') {
                minPriceInput.value = '';
                maxPriceInput.value = '';
            } else if (preset === 'small') {
                minPriceInput.value = '';
                maxPriceInput.value = '349';
            } else if (preset === 'medium') {
                minPriceInput.value = '350';
                maxPriceInput.value = '450';
            } else if (preset === 'large') {
                minPriceInput.value = '451';
                maxPriceInput.value = '';
            }
            
            applyFiltersAndRebuildDropdowns();
        });
    });

    const onPriceRangeInput = () => {
        pricePresetBtns.forEach(btn => btn.classList.remove('active'));
        
        const minVal = minPriceInput.value;
        const maxVal = maxPriceInput.value;
        
        if (minVal === '' && maxVal === '') {
            document.querySelector('#price-filter-card [data-price-preset="all"]').classList.add('active');
        } else if (minVal === '' && maxVal === '349') {
            document.querySelector('#price-filter-card [data-price-preset="small"]').classList.add('active');
        } else if (minVal === '350' && maxVal === '450') {
            document.querySelector('#price-filter-card [data-price-preset="medium"]').classList.add('active');
        } else if (minVal === '451' && maxVal === '') {
            document.querySelector('#price-filter-card [data-price-preset="large"]').classList.add('active');
        }
        
        applyFiltersAndRebuildDropdowns();
    };

    minPriceInput.addEventListener('input', onPriceRangeInput);
    maxPriceInput.addEventListener('input', onPriceRangeInput);

    resetPriceBtn.addEventListener('click', () => {
        minPriceInput.value = '';
        maxPriceInput.value = '';
        pricePresetBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector('#price-filter-card [data-price-preset="all"]').classList.add('active');
        applyFiltersAndRebuildDropdowns();
    });

    function applyFiltersAndRebuildDropdowns() {
        const minSize = minSizeInput.value ? parseInt(minSizeInput.value, 10) : 0;
        const maxSize = maxSizeInput.value ? parseInt(maxSizeInput.value, 10) : Infinity;
        
        const minPrice = minPriceInput.value ? parseInt(minPriceInput.value, 10) * 10000 : 0;
        const maxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value, 10) * 10000 : Infinity;
        
        filteredFlats = allFlats.filter(flat => {
            const sqFt = flat.size_sq_ft;
            const price = flat.price || 0;
            return sqFt >= minSize && sqFt <= maxSize && price >= minPrice && price <= maxPrice;
        });

        if (matchBadge) {
            matchBadge.textContent = `${filteredFlats.length} 個符合單位`;
        }
        
        const prevSelectedBlock = blockSelect.value;
        const prevSelectedFloor = floorSelect.value;
        const prevSelectedFlat = flatSelect.value;
        
        populateBlocks(prevSelectedBlock);
        
        if (blockSelect.value) {
            populateFloors(blockSelect.value, prevSelectedFloor);
            
            if (floorSelect.value) {
                populateFlats(blockSelect.value, floorSelect.value, prevSelectedFlat);
                
                if (flatSelect.value) {
                    renderFlatDetails(blockSelect.value, floorSelect.value, flatSelect.value);
                    return;
                }
            }
        }
        
        if (!flatSelect.value) {
            clearFlatDetails();
        }

        // Dynamic automatic zooming on active block selection
        zoomToBlock(blockSelect.value);
    }

    // Handles map panned zooming focusing on selected building tower
    function zoomToBlock(blockName) {
        if (mapInner && BLOCK_CENTERS[blockName]) {
            const center = BLOCK_CENTERS[blockName];
            mapInner.style.transformOrigin = `${center.x}% ${center.y}%`;
            mapInner.style.transform = 'scale(2.4)';
        } else if (mapInner) {
            mapInner.style.transformOrigin = '50% 50%';
            mapInner.style.transform = 'scale(1)';
        }
    }

    // ==========================================================================
    // 3. Cascading Dropdown Populators
    // ==========================================================================

    function populateBlocks(selectedValue = '') {
        const blocks = [...new Set(filteredFlats.map(f => f.block))];
        
        blocks.sort((a, b) => {
            const getSortKey = (str) => {
                const match = str.match(/Tower\s+(\d+)([A-Z])/i);
                if (match) {
                    return [parseInt(match[1], 10), match[2]];
                }
                return [Infinity, str];
            };
            const [numA, letA] = getSortKey(a);
            const [numB, letB] = getSortKey(b);
            
            if (numA !== numB) return numA - numB;
            return letA.localeCompare(letB);
        });

        if (blocks.length === 0) {
            blockSelect.innerHTML = `<option value="">無符合篩選條件的座數</option>`;
            blockSelect.setAttribute('disabled', 'true');
            floorSelect.innerHTML = `<option value="">--</option>`;
            floorSelect.setAttribute('disabled', 'true');
            flatSelect.innerHTML = `<option value="">--</option>`;
            flatSelect.setAttribute('disabled', 'true');
            return;
        }

        blockSelect.removeAttribute('disabled');
        let html = `<option value="">-- 選擇大廈 / 座數 (Block) --</option>`;
        blocks.forEach(block => {
            html += `<option value="${block}">${block}</option>`;
        });
        blockSelect.innerHTML = html;
        
        if (selectedValue && blocks.includes(selectedValue)) {
            blockSelect.value = selectedValue;
        } else {
            blockSelect.value = '';
            floorSelect.innerHTML = `<option value="">請先選擇大廈</option>`;
            floorSelect.setAttribute('disabled', 'true');
            flatSelect.innerHTML = `<option value="">請先選擇樓層</option>`;
            flatSelect.setAttribute('disabled', 'true');
        }
    }

    function populateFloors(block, selectedValue = '') {
        if (!block) {
            floorSelect.innerHTML = `<option value="">請先選擇大廈</option>`;
            floorSelect.setAttribute('disabled', 'true');
            flatSelect.innerHTML = `<option value="">請先選擇樓層</option>`;
            flatSelect.setAttribute('disabled', 'true');
            return;
        }

        const floors = [...new Set(filteredFlats.filter(f => f.block === block).map(f => f.floor))];
        floors.sort((a, b) => a - b);

        floorSelect.removeAttribute('disabled');
        let html = `<option value="">-- 選擇樓層 (Floor) --</option>`;
        floors.forEach(floor => {
            html += `<option value="${floor}">${floor} 樓 (${floor}/F)</option>`;
        });
        floorSelect.innerHTML = html;

        const valString = selectedValue ? parseInt(selectedValue, 10) : NaN;
        if (selectedValue && floors.includes(valString)) {
            floorSelect.value = valString;
        } else {
            floorSelect.value = '';
            flatSelect.innerHTML = `<option value="">請先選擇樓層</option>`;
            flatSelect.setAttribute('disabled', 'true');
        }
    }

    function populateFlats(block, floor, selectedValue = '') {
        if (!block || !floor) {
            flatSelect.innerHTML = `<option value="">請先選擇樓層</option>`;
            flatSelect.setAttribute('disabled', 'true');
            return;
        }

        const flats = [...new Set(filteredFlats
            .filter(f => f.block === block && f.floor === parseInt(floor, 10))
            .map(f => f.flat))];
        flats.sort();

        flatSelect.removeAttribute('disabled');
        let html = `<option value="">-- 選擇單位 (Flat) --</option>`;
        flats.forEach(flat => {
            html += `<option value="${flat}">Flat ${flat} 單位</option>`;
        });
        flatSelect.innerHTML = html;

        if (selectedValue && flats.includes(selectedValue)) {
            flatSelect.value = selectedValue;
        } else {
            flatSelect.value = '';
        }
    }

    // ==========================================================================
    // 4. Dropdown Change Event Listeners
    // ==========================================================================
    blockSelect.addEventListener('change', (e) => {
        const block = e.target.value;
        populateFloors(block);
        clearFlatDetails();
        zoomToBlock(block); // Instant smooth zoom when block selection is changed
    });

    floorSelect.addEventListener('change', (e) => {
        const block = blockSelect.value;
        const floor = e.target.value;
        populateFlats(block, floor);
        clearFlatDetails();
    });

    flatSelect.addEventListener('change', (e) => {
        const block = blockSelect.value;
        const floor = floorSelect.value;
        const flat = e.target.value;
        
        if (flat) {
            renderFlatDetails(block, floor, flat);
        } else {
            clearFlatDetails();
        }
    });

    // ==========================================================================
    // 5. Details Card Renderer
    // ==========================================================================
    function renderFlatDetails(block, floor, flat) {
        const parsedFloor = parseInt(floor, 10);
        const flatObj = allFlats.find(f => f.block === block && f.floor === parsedFloor && f.flat === flat);
        
        if (!flatObj) {
            clearFlatDetails();
            return;
        }

        // Hide Empty State, Show Content
        emptyState.classList.add('hidden');
        detailsContent.classList.remove('hidden');

        // Populate Badge and Header
        detailBlockBadge.textContent = block;
        detailFloor.textContent = `${parsedFloor} 樓 (${parsedFloor}/F)`;
        detailFlat.textContent = flat;

        // Populate Sizing Details
        detailSizeFt.textContent = flatObj.size_sq_ft.toLocaleString();
        detailSizeM.textContent = flatObj.size_sq_m.toFixed(3);

        // Populate Price Details
        if (flatObj.price) {
            detailPrice.textContent = `$${flatObj.price.toLocaleString()}`;
        } else {
            detailPrice.textContent = '暫無資料';
        }

        // Populate Unit Rates
        if (flatObj.unit_rate_sq_ft) {
            detailRateFt.textContent = `$${flatObj.unit_rate_sq_ft.toLocaleString()}`;
        } else {
            detailRateFt.textContent = '暫無資料';
        }

        if (flatObj.unit_rate_sq_m) {
            detailRateM.textContent = `$${flatObj.unit_rate_sq_m.toLocaleString()}`;
        } else {
            detailRateM.textContent = '暫無資料';
        }

        // Populate Outdoor Features (Balcony and Utility Platform)
        if (flatObj.balcony) {
            featureBalconyContainer.classList.remove('inactive');
            detailBalcony.textContent = flatObj.balcony.toFixed(3);
        } else {
            featureBalconyContainer.classList.add('inactive');
            detailBalcony.textContent = '0.000';
        }

        if (flatObj.utility_platform) {
            featureUtilityContainer.classList.remove('inactive');
            detailUtility.textContent = flatObj.utility_platform.toFixed(3);
        } else {
            featureUtilityContainer.classList.add('inactive');
            detailUtility.textContent = '0.000';
        }

        // Update Map Pin Highlight
        if (mapMarker && FLAT_COORDINATES[block] && FLAT_COORDINATES[block][flat]) {
            const coord = FLAT_COORDINATES[block][flat];
            mapMarker.style.left = `${coord.x}%`;
            mapMarker.style.top = `${coord.y}%`;
            mapMarker.classList.remove('hidden');
            if (mapHint) {
                mapHint.textContent = `已定位：${block} Floor ${parsedFloor}, Flat ${flat}`;
                mapHint.style.borderColor = 'rgba(223, 176, 108, 0.4)';
                mapHint.style.color = 'var(--gold)';
            }
        } else {
            if (mapMarker) mapMarker.classList.add('hidden');
            if (mapHint) {
                mapHint.textContent = "選擇單位以在平面圖上定位";
                mapHint.style.borderColor = '';
                mapHint.style.color = '';
            }
        }
    }

    function clearFlatDetails() {
        emptyState.classList.remove('hidden');
        detailsContent.classList.add('hidden');
        if (mapMarker) mapMarker.classList.add('hidden');
        if (mapHint) {
            mapHint.textContent = "選擇單位以在平面圖上定位";
            mapHint.style.borderColor = '';
            mapHint.style.color = '';
        }
    }

    // Developer helper: Shift + Click on the map to find and copy percentage coordinates
    if (mapWrapper) {
        mapWrapper.addEventListener('click', (e) => {
            if (e.shiftKey) {
                const rect = mapWrapper.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                console.log(`Dev Coordinate Helper -> x: ${x.toFixed(1)}, y: ${y.toFixed(1)}`);
                alert(`Dev Coordinates:\nx: ${x.toFixed(1)},\ny: ${y.toFixed(1)}`);
            }
        });
    }

    // ==========================================================================
    // 7. Multi-Estate Dynamic Loader (CORS-free file:// compatible)
    // ==========================================================================
    const ESTATE_MAPS = {
        "HemmaSapphire": "HemmaSapphire/20260508201120_1_desktop.png",
        "SierraTerrace": "SierraTerrace/img_layout_plan_tc.png"
    };

    if (estateSelect) {
        estateSelect.addEventListener('change', (e) => {
            const estate = e.target.value;
            loadEstateData(estate);
        });
    }

    function loadEstateData(estateValue) {
        // Clear current elements while loading
        blockSelect.setAttribute('disabled', 'true');
        blockSelect.innerHTML = `<option value="">正在載入項目數據...</option>`;
        floorSelect.setAttribute('disabled', 'true');
        floorSelect.innerHTML = `<option value="">請先選擇大廈</option>`;
        flatSelect.setAttribute('disabled', 'true');
        flatSelect.innerHTML = `<option value="">請先選擇樓層</option>`;
        clearFlatDetails();

        // Update estate map image
        if (mapImage && ESTATE_MAPS[estateValue]) {
            mapImage.src = ESTATE_MAPS[estateValue];
        }

        // Reset inputs and filters
        minSizeInput.value = '';
        maxSizeInput.value = '';
        sizePresetBtns.forEach(btn => btn.classList.remove('active'));
        const sizeAllBtn = document.querySelector('#size-filter-card [data-preset="all"]');
        if (sizeAllBtn) sizeAllBtn.classList.add('active');

        minPriceInput.value = '';
        maxPriceInput.value = '';
        pricePresetBtns.forEach(btn => btn.classList.remove('active'));
        const priceAllBtn = document.querySelector('#price-filter-card [data-price-preset="all"]');
        if (priceAllBtn) priceAllBtn.classList.add('active');

        // Remove old dynamic script tag
        const oldScript = document.getElementById('dynamic-estate-script');
        if (oldScript) {
            oldScript.remove();
        }

        // Add new script tag to load the selected estate data
        const script = document.createElement('script');
        script.id = 'dynamic-estate-script';
        script.src = `public/${estateValue}_data.js`;
        script.onload = () => {
            if (typeof allFlatsData !== 'undefined') {
                initWithData(allFlatsData);
            } else {
                blockSelect.innerHTML = `<option value="">載入失敗：數據不完整</option>`;
            }
        };
        script.onerror = () => {
            blockSelect.innerHTML = `<option value="">載入失敗：請確認新增的 public/${estateValue}_data.js 是否存在</option>`;
        };
        document.body.appendChild(script);
    }

    // Initialize the application!
    init();
});
