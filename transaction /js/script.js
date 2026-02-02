const detected = document.querySelector(".nearShops");

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad1 = lat1 * Math.PI / 180;
  const rad2 = lat2 * Math.PI / 180;
  const Δrad = (lat2 - lat1) * Math.PI / 180;
  const Δlog = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(Δrad / 2) * Math.sin(Δrad / 2) +
    Math.cos(rad1) * Math.cos(rad2) *
    Math.sin(Δlog / 2) * Math.sin(Δlog / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

async function getShops() {
  try {
    const res = await fetch("");
    const data = await res.json();
    console.log(data)
  } catch(err) {
    console.log(err)
  }
}

getShops();