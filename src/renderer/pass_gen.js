

// Clip board to copy password result
//
const clipboard = require('electron').clipboard
const copyBtn = document.getElementById('copy_btn')
const copyInput = document.getElementById('gen_result')
generate_password();





copyBtn.addEventListener('click', function () {
    clipboard.writeText(copyInput.innerHTML)
    new Notification("Vaultron",{
        body: 'Password Copied!'
    })
});


/**
 * flips the value of input_check to the opposite of its current value
 * (i.e. if on -> off, if off -> on)
 * @param {*} input_check 
 */

function switch_val(input_check){
    if (input_check.value == 0){
        input_check.value = 1;
    }
    else{ input_check.value = 0;}
}


/**
 * generates a random password
 */
function generate_password(){
    
    // STEP 1
    // - set default lengths for strings
    // - check inputs are within bounds
    //
    const min_pass_len = 5;
    const max_pass_len = 5000;

    var len = document.getElementById("length").value;
    if (len < 5){
        var mes = "Passwords should be at least " + min_pass_len + " characters long";
        document.getElementById("gen_result").innerHTML = mes;
        return;
    }
    else if (len > max_pass_len){
        var mes = "Passwords should less than " + max_pass_len + " characters long";
        document.getElementById("gen_result").innerHTML = mes;
        return;
    }

    // STEP 2
    // S1 - get input values
    // S2 - Push all the characters specified by the user to an array
    // S3 - make sure chars include more than just spaces or nothing
    
    // == S1 ==
    //
    let num = document.getElementById("number").value;
    let low = document.getElementById("lower").value;
    let upp = document.getElementById("upper").value;
    let sym = document.getElementById("symbol").value;
    let spa = document.getElementById("space").value;

    // == S2 ==
    //
    var char_choices = []; 
    if (spa == 1){
        char_choices.push(32); 
    }
    if (num == 1){
        for (var i=48; i<58; i++){ char_choices.push(i); }
    }
    if (upp == 1){
        for (var i=65; i<91; i++){ char_choices.push(i); }
    }
    if (low == 1){
        for (var i=97; i<123; i++){ char_choices.push(i); }
    }
    if (sym == 1){
        for (var i=33; i<48; i++){ char_choices.push(i); }
        for (var i=58; i<65; i++){ char_choices.push(i); }
        for (var i=123; i<127; i++){ char_choices.push(i); }
    }
    
    // == S3 == 
    //
    if (char_choices.length == 1){
        document.getElementById("gen_result").innerHTML = "Only spaces! I could guess that without a for loop!";
        return;
    }
    else if (char_choices.length == 0){
        document.getElementById("gen_result").innerHTML = "Need to choose character set";
        return;
    }
    
    // STEP 3
    // S4 - fill uint8 array (vals 0 to 255) with cryptographically 
    //      random values
    // S5 - iterate over random uint8 array and add character value 
    //      to output string if value is in input choices array


    // == S4 ==
    //
    var uint8 = new Uint8Array(len);
    window.crypto.getRandomValues(uint8);
    var output = "";
    var i = 0;
    
    // == S5 ==
    //
    while (output.length < uint8.length){
        if (char_choices.indexOf(uint8[i]) != -1){
            output += String.fromCharCode(uint8[i]);
        }
        else if (i >= uint8.length - 1){
            window.crypto.getRandomValues(uint8);
            i = 0;
        }
        i++;
        
    }
    console.log(output);
    document.getElementById("gen_result").innerHTML = output;
}


/* 
=== node.crypto library method for selecting random bytes   ===
=== i keep it here in case we decide to switch the function ===

function generate_password(){
    crypto.randomBytes(256, (err, buf) => {
      if (err) throw err;
      document.getElementById("gen_result").innerHTML = buf.toString('hex');
      //console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
    });    
}
*/
