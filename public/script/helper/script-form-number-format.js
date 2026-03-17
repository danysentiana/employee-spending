function formatThreeDecimals(input) {
    let value = input.value.replace(/\./g, ',');

    value = value.replace(/[^0-9,]/g, '');

    if (value.includes(',')) {
        let parts = value.split(',');

        if (parts[0].length > 3) {
            parts[0] = parts[0].substring(0, 3);
        }
        
        if (parts[1] && parts[1].length > 3) {
            parts[1] = parts[1].substring(0, 3);
        }

        value = parts[0] + ',' + (parts[1] || '');
        
    } else {
        if (value.length > 3) {
            value = value.substring(0, 3);
        }
    }

    input.value = value;
}

// FormNumberFormatter object for handling number formatting/unformatting
window.FormNumberFormatter = {
    // Unformat number from display format back to raw number
    unformatNumber: function(value) {
        if (!value) return '0';
        
        // Remove dots (thousand separators) and replace comma with dot (decimal separator)
        return value.toString().replace(/\./g, '').replace(/,/g, '.');
    },
    
    // Format initial values when page loads
    formatInitialValues: function() {
        // Format percentage fields
        $('input[oninput*="formatThreeDecimals"]').each(function() {
            if ($(this).val()) {
                formatThreeDecimals(this);
            }
        });
        
        // Format currency fields
        $('input[oninput*="formatRupiah"]').each(function() {
            if ($(this).val()) {
                formatRupiah(this);
            }
        });
    }
};

function formatRupiah(input) {
    let value = input.value.replace(/[^0-9]/g, '');

    if (value) {
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    input.value = value;
}

function identityNumber(input) {
    // only number and limit to 16 characters
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length > 16) {
        value = value.substring(0, 16);
    }

    input.value = value;
}

function accountNumber(input) {
    // only number and limit to 20 characters
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length > 20) {
        value = value.substring(0, 20);
    }

    input.value = value;
}
