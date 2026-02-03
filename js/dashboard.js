

const locationsBtn = document.querySelector(".locationsBtn");
  const favouritesBtn = document.querySelector(".favouritesBtn");
  const profileBtn = document.querySelector(".profileBtn");
  const locations = document.querySelector(".locations");
  const nearestLocations = document.querySelector(".nearest");
  const paymentFormContainer = document.querySelector(".paymentFormContainer");
  const main = document.querySelector("main");
  
  let saved = null;
  
async function getLocations() { 
  try {
  const response = await fetch("https://domtech-server-juf6.onrender.com/");
  if (!response.ok) throw new Error("The network was not ok");
  const locations = await response.json();
   saved = locations;
  return saved;
  } catch (err) {
    console.log(err.message);
  }
  
  }
  
  function coordinates(maxAccuracy = 100) {
  return new Promise((resolve, reject) => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy <= maxAccuracy) {
          navigator.geolocation.clearWatch(watchId);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        }
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000
      }
    );
  });
}
  
  function getDistance(lat1, log1, lat2, log2) {
  const earthRadiusKm = 6371;

  const toRadians = value => value * Math.PI / 180;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(log2 - log1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

  
  
  
  
  
 async function nearest() {
   const coords = await coordinates();
   const bussinessLocation = await getLocations();
   console.log(bussinessLocation);
   for (const n of bussinessLocation) {
     const dis = getDistance(coords.latitude, coords.longitude, n.latitude, n.longitude);
     console.log(dis);
     if (dis <= 0.1) {
      const p = document.createElement("p");
      p.innerText = n.location_name;
      nearestLocations.appendChild(p);
     }
     
   }
   
 }
  
 nearest();
  
  
  paymentFormContainer.style.display = "none";
  let check = false;
  
  
  
  locationsBtn.onclick = async () => {
    const savedLocations = await getLocations();
    locations.innerHTML = "";
    nearestLocations.style.display = "none";
    paymentFormContainer.style.display = "none";
    
    for (const n of savedLocations) {
      
      const div = document.createElement("div");
    const p = document.createElement("p");
    p.className = "location";
    p.innerText = n.location_name;
    
    const lveBtn = document.createElement("button");
    lveBtn.className = "lveBtn";
    const i = document.createElement("i");
    i.className = "far fa-heart";
    lveBtn.appendChild(i);
    lveBtn.className = "lveBtn";
    
    let condition = true;
    lveBtn.onclick = () => {
      i.className = condition ? "fas fa-heart" : "far fa-heart";
      condition = !condition;
    }
    
    p.onclick = () => {
      const mpesaRes = document.createElement("div");
      mpesaRes.setAttribute("class", "mpesaRes");
      
      
      
      const mpesaLogo = document.createElement("img");
      mpesaLogo.src="/assets/1274f5210994221.Y3JvcCw0NTAwLDM1MTksMCw1MDE.jpg";
      
      
    paymentFormContainer.style.display = "block";
      paymentFormContainer.innerHTML = "";
      locations.style.display = "none";
      const name = document.createElement("p");
      name.setAttribute("class", "paying");
      name.innerText = `Paying at ${n.location_name}`;
      paymentFormContainer.appendChild(name);
      const form = document.createElement("form");
      form.setAttribute("class", "paymentForm");
      const amountLabel = document.createElement("label");
      amountLabel.for = "amount";
      amountLabel.innerText = "Amount: ";
      const amountInput = document.createElement("input");
      amountInput.setAttribute("autofocus", true);
      amountInput.type = "number";
      amountInput.id = "amount";
      amountInput.name = "amount";
      amountInput.setAttribute("required", true);
      
      const phoneLabel = document.createElement("label");
      phoneLabel.for = "phone";
      phoneLabel.innerText = "Phone: ";
      const phoneInput = document.createElement("input");
      phoneInput.type = "number";
      phoneInput.id = "phone";
      phoneInput.name = "phone";
      phoneInput.setAttribute("required", true);
      
      
    
      phoneInput.value = localStorage.getItem("number");


      const inputs = [ phoneInput, amountInput ];
      inputs.forEach((input) => {
        input.oninput = () => {
          mpesaRes.innerHTML = "";
          mpesaRes.classList.remove("showRes");
          mpesaRes.classList.remove("showFailedRes");
        }
      })
      
      
      const div = document.createElement("div");
      div.setAttribute("class", "cancelAndSendBtn")
      const cancelBtn = document.createElement("button");
      cancelBtn.innerText = "cancel";
      cancelBtn.onclick = () => {
        locationsBtn.click();
      }
      cancelBtn.type = "button";
      const payBtn = document.createElement("button");
      payBtn.type = "submit";
      payBtn.innerText = "send";
      
      div.appendChild(cancelBtn);
      div.appendChild(payBtn);
      form.appendChild(amountLabel);
      form.appendChild(amountInput);
      form.appendChild(phoneLabel);
      form.appendChild(phoneInput);
      form.appendChild(div);
      
      form.onsubmit = async (e) => {
        
        e.preventDefault();
        const regex = /^(07|01)\d{8}$/;
         if (!regex.test(phoneInput.value)) {
           alert("Enter the correct phone number stating with 07/01 and strictly equal to 10 digits");
           return;
         }
        
        
        if (amountInput.value < 1) {
          alert("Amount cannot be less than Ksh 1");
          return;
        }
        
        payBtn.innerText = "processing...";
        payBtn.setAttribute("disabled", "true");
        
       const res = await fetch(`https://domtech-server-juf6.onrender.com/pay/${n.location_id}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: amountInput.value,
            phone: phoneInput.value
          })
        });
        
        const data = await res.json();
        if (data.ResultCode === 0) {
        mpesaRes.innerHTML = `<p class='accepted'>Please check your phone for an M pesa pop-up.</p>`;
        mpesaRes.classList.add("showRes")
        }
        
       const polling = setInterval( async () => {
          try {
            const res = await fetch(`https://domtech-server-juf6.onrender.com/pay/${data.CheckoutRequestID}/status`);
            
         const callbackData = await res.json();
            
      
            if ( callbackData.status === "SUCCESS") {
                mpesaRes.innerHTML = `<p class="checkContainer"><i class="fas fa-circle-check"></i></p>
  <p class="mpesaText">KSh ${amountInput.value} sent successfully
You will receive an M-Pesa confirmation SMS shortly.</p>`;
mpesaRes.classList.add("showRes");
 clearInterval(polling);
 payBtn.removeAttribute("disabled");
   payBtn.innerText = "send";
            }
        
        if (callbackData.status === "FAILED") {
        mpesaRes.innerHTML = ` <p class="failedRes"><i class="fas fa-circle-xmark"></i></p>
  <p class="failedText">${callbackData.description}</p>`
  mpesaRes.classList.add("showFailedRes");
           clearInterval(polling);
           payBtn.removeAttribute("disabled");
   payBtn.innerText = "send"
        }  
            
          } catch(err) {
            console.log(err)
            mpesaRes.innerHTML = ` <p class="failedRes"><i class="fas fa-circle-xmark"></i></p>
  <p class="failedText">${err.message}</p>`;
  mpesaRes.classList.add("showFailedRes");
   payBtn.removeAttribute("disabled");
   payBtn.innerText = "send"
          }
        }, 3000);
        
      }
      
      
      
      paymentFormContainer.appendChild(mpesaRes);
      paymentFormContainer.appendChild(mpesaLogo);
      paymentFormContainer.appendChild(form);
    }
    
    div.appendChild(lveBtn);
    div.appendChild(p);
    locations.appendChild(div);
      
    }
  
    
    if (!check) {
      locations.style.display = "block";
      locations.style.transform = "translateX(0)";
    }
  } 
  
/*  favouritesBtn.onclick = () => {
    
      locations.innerHTML = "";
    paymentFormContainer.style.display = "none";
    nearestLocations.style.display = "none";
  


    for (const n of savedLocations) {
      
      const div = document.createElement("div");
    const p = document.createElement("p");
    const lveBtn = document.createElement("button");
    lveBtn.className = "lveBtn";
    const i = document.createElement("i");
    i.className = "far fa-heart";
    lveBtn.appendChild(i);
    lveBtn.className = "lveBtn";
    
    let condition = true;
    lveBtn.onclick = () => {
      i.className = condition ? "fas fa-heart" : "far fa-heart";
      condition = !condition;
    }
    
    p.onclick = () => {
      const mpesaRes = document.createElement("div");
      mpesaRes.setAttribute("class", "mpesaRes");
      
      
      
      const mpesaLogo = document.createElement("img");
      mpesaLogo.src="/assets/1274f5210994221.Y3JvcCw0NTAwLDM1MTksMCw1MDE.jpg";
      
      
    paymentFormContainer.style.display = "block";
      paymentFormContainer.innerHTML = "";
      locations.style.display = "none";
      const name = document.createElement("p");
      name.setAttribute("class", "paying");
      name.innerText = `Paying at ${n.name}`;
      paymentFormContainer.appendChild(name);
      const form = document.createElement("form");
      form.setAttribute("class", "paymentForm");
      const amountLabel = document.createElement("label");
      amountLabel.for = "amount";
      amountLabel.innerText = "Amount: ";
      const amountInput = document.createElement("input");
      amountInput.setAttribute("autofocus", true);
      amountInput.type = "number";
      amountInput.id = "amount";
      amountInput.name = "amount";
      amountInput.setAttribute("required", true);
      
      const phoneLabel = document.createElement("label");
      phoneLabel.for = "phone";
      phoneLabel.innerText = "Phone: ";
      const phoneInput = document.createElement("input");
      phoneInput.type = "number";
      phoneInput.id = "phone";
      phoneInput.name = "phone";
      phoneInput.setAttribute("required", true);
      
      const inputs = [ phoneInput, amountInput ];
      inputs.forEach((input) => {
        input.oninput = () => {
          mpesaRes.innerHTML = "";
          mpesaRes.classList.remove("showRes");
        }
      })
      
      
      const div = document.createElement("div");
      div.setAttribute("class", "cancelAndSendBtn")
      const cancelBtn = document.createElement("button");
      cancelBtn.innerText = "cancel";
      cancelBtn.type = "button";
      const payBtn = document.createElement("button");
      payBtn.type = "submit";
      payBtn.innerText = "send";
      
      div.appendChild(cancelBtn);
      div.appendChild(payBtn);
      form.appendChild(amountLabel);
      form.appendChild(amountInput);
      form.appendChild(phoneLabel);
      form.appendChild(phoneInput);
      form.appendChild(div);
      
      form.onsubmit = (e) => {
        e.preventDefault();
        mpesaRes.classList.add("showRes");
        
        mpesaRes.innerHTML = `<p class="checkContainer"><i class="fas fa-circle-check"></i></p>
  <p class="mpesaText">Payment of ksh 200 at dot has been successfully processed. Thanks for transacting with us.</p>`;
        
        
        
        
      }
      
      
      
      paymentFormContainer.appendChild(mpesaRes);
      paymentFormContainer.appendChild(mpesaLogo);
      paymentFormContainer.appendChild(form);
    }
    
    p.className = "location";
    p.innerText = n.name;
    div.appendChild(lveBtn);
    div.appendChild(p);
    locations.appendChild(div);
    }
    
    
    
    if (check) {
      locations.style.transform = "translateX(50%)";
    check = false;
    } else {
      locations.style.display = "block";
      locations.style.transform = "translateX(50%)"
    }
  }*/
  profileBtn.onclick = () => {

    window.location.href = "/html/profile.html";
  }
  
