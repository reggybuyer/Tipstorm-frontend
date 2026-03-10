import React, { useEffect, useState, useCallback } from "react";

const API = process.env.REACT_APP_API_BASE || "https://tipstorm-backend.onrender.com";

export default function User(){

const [slips,setSlips]=useState([]);
const [user,setUser]=useState(null);
const [planSelect,setPlanSelect]=useState("weekly");
const [loading,setLoading]=useState(true);

const token=localStorage.getItem("token");

const logout=()=>{
localStorage.clear();
window.location.href="/login";
};

const loadProfile=useCallback(async()=>{

try{

const res=await fetch(`${API}/profile`,{
headers:{Authorization:`Bearer ${token}`}
});

const data=await res.json();

if(!data.success){
logout();
return;
}

setUser(data.user);

}catch{

logout();

}finally{

setLoading(false);

}

},[token]);

const loadSlips=useCallback(async()=>{

const res=await fetch(`${API}/slips`);
const data=await res.json();

setSlips(data.slips||[]);

},[]);

const getAmount=()=>{

if(planSelect==="weekly") return 500;
if(planSelect==="monthly") return 1000;
if(planSelect==="vip") return 1500;

return 0;
};

const requestActivation=async()=>{

await fetch(`${API}/request-subscription`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:user.email,
plan:planSelect
})
});

alert("Send payment confirmation to WhatsApp 0789906001");

};

useEffect(()=>{

if(!token){
window.location.href="/login";
return;
}

loadProfile();
loadSlips();

},[token,loadProfile,loadSlips]);

if(loading) return <div>Loading...</div>;

return(

<div className="section">

<h2>Welcome {user.email}</h2>

<button onClick={logout}>Logout</button>

<div className="card">

<h3>Your Plan {user.plan}</h3>

<select
value={planSelect}
onChange={e=>setPlanSelect(e.target.value)}
>

<option value="weekly">Weekly - 500</option>
<option value="monthly">Monthly - 1000</option>
<option value="vip">VIP - 1500</option>

</select>

<p>Amount Ksh {getAmount()}</p>

<p>Paybill 625625</p>

<p>Account 20170457</p>

<p>Send confirmation to WhatsApp 0789906001</p>

<button onClick={requestActivation}>
Request Upgrade
</button>

</div>

<div className="card">

<h3>Available Slips</h3>

{slips.map(slip=>{

const totalOdds=(slip.games||[])
.reduce((acc,g)=>acc*(parseFloat(g.odds)||1),1);

return(

<div key={slip._id}>

<h4>{slip.date}</h4>

<p>{slip.access}</p>

<p>Total Odds {totalOdds.toFixed(2)}</p>

{slip.games?.map((g,i)=>(
<div key={i}>

<span>{g.home} vs {g.away}</span>

<span>Odd {(parseFloat(g.odds)||1).toFixed(2)}</span>

<span>
{g.result==="won"?"✅":g.result==="lost"?"❌":"pending"}
</span>

</div>
))}

</div>

);

})}

</div>

</div>

);

} 
