const pillarData = {
    "trails": {
        title: "Food Trails: The Journey of Taste",
        content: `
            <ul class="modal-list">
                <li>
                    <strong>The Royal Chettinad Spice Trail</strong><br>
                    Route: Karaikudi – Kanadukathan – Devakottai.<br>
                    Experience heritage mansions and visit the weekly spice markets.
                </li>
                <li>
                    <strong>The Kongu Nadu Feast Trail</strong><br>
                    Route: Coimbatore – Erode – Pollachi.<br>
                    Focus on turmeric and coconut. Farm-to-table lunches in lush groves.
                </li>
                <li>
                    <strong>The Coastal Seafood Trail</strong><br>
                    Route: Chennai – Pondicherry – Rameswaram.<br>
                    From Marina Beach Sundal to spicy coastal crab curries.
                </li>
                <li>
                    <strong>The Biryani Map</strong><br>
                    Route: Ambur – Dindigul – Chennai.<br>
                    A tasting challenge comparing Seeraga Samba vs. Basmati styles.
                </li>
            </ul>
        `
    },
    "networks": {
        title: "Cooking Networks: Connect with Locals",
        content: `
            <ul class="modal-list">
                <li>
                    <strong>Grandma’s Kitchen (Paati Veedu)</strong><br>
                    Dine in a local ancestral home. Learn a family heirloom recipe directly from the matriarch.
                </li>
                <li>
                    <strong>Chef Exchange Program</strong><br>
                    Pop-up events where top chefs collaborate with rural home cooks to create fusion menus.
                </li>
                <li>
                    <strong>Digital Recipe Archive</strong><br>
                    Contribute to a community wiki preserving rare, dying recipes for future generations.
                </li>
            </ul>
        `
    },
    "experiences": {
        title: "Culinary Experiences: Don't Just Eat",
        content: `
            <ul class="modal-list">
                <li>
                    <strong>MasterChef Madurai Walk</strong><br>
                    Guided night walks through Madurai’s food streets. Learn to flip a Parotta or mix a Jigarthanda.
                </li>
                <li>
                    <strong>Temple Kitchens Tour</strong><br>
                    Exclusive access to see massive temple kitchens and learn the science of Prasadam (e.g., Puliyodarai).
                </li>
                <li>
                    <strong>Plantation Picnics</strong><br>
                    Lunch served in the middle of a tea estate in Ooty or a spice garden in Kodaikanal.
                </li>
            </ul>
        `
    },
    "ventures": {
        title: "Gourmet Ventures: Take It Home",
        content: `
            <ul class="modal-list">
                <li>
                    <strong>GI Tagged Gift Boxes</strong><br>
                    Premium boxes with Kovilpatti Kadalai Mittai, Palani Panchamirtham, and Srivilliputhur Palkova.
                </li>
                <li>
                    <strong>Madras Filter Coffee Kit</strong><br>
                    A sleek kit with a brass davara tumbler, premium coffee blend, and brewing guide.
                </li>
                <li>
                    <strong>Artisanal Spice Blends</strong><br>
                    Small-batch, stone-ground masalas packaged in eco-friendly jars, telling the farmer's story.
                </li>
            </ul>
        `
    }
};

function openModal(type) {
    const modal = document.getElementById('infoModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (pillarData[type]) {
        title.innerHTML = pillarData[type].title;
        body.innerHTML = pillarData[type].content;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal() {
    const modal = document.getElementById('infoModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) {
        closeModal();
    }
}
