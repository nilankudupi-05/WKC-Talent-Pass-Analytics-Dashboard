import React from "react";
const { useState, useRef } = React;

const GST = 0.18;
const MODEL = "claude-sonnet-4-20250514";
const DATES = (() => { const d=[]; let c=new Date("2026-04-25"),e=new Date("2026-05-19"); for(;c<=e;c.setDate(c.getDate()+1)) d.push(c.toISOString().slice(0,10)); return d; })();

const SEED_DEPS = [
  {date:"2026-05-03",label:"New landing page"},
  {date:"2026-05-05",label:"New recommendation page"},
  {date:"2026-05-12",label:"Claude's rec page changes"},
  {date:"2026-05-14",label:"Abhishek's landing page"},
];

const SEED_META = {"2026-04-25":{adSpend:"402.51",impressions:"1644",reach:"1434",linkClicks:"37",lpv:"30"},"2026-04-26":{adSpend:"466.80",impressions:"1493",reach:"1277",linkClicks:"50",lpv:"37"},"2026-04-27":{adSpend:"496.35",impressions:"1134",reach:"1011",linkClicks:"35",lpv:"28"},"2026-04-28":{adSpend:"487.96",impressions:"1528",reach:"1238",linkClicks:"32",lpv:"25"},"2026-04-29":{adSpend:"553.84",impressions:"1522",reach:"1303",linkClicks:"32",lpv:"25"},"2026-04-30":{adSpend:"535.89",impressions:"1081",reach:"850",linkClicks:"39",lpv:"29"},"2026-05-01":{adSpend:"528.68",impressions:"1527",reach:"1339",linkClicks:"43",lpv:"38"},"2026-05-02":{adSpend:"429.19",impressions:"1582",reach:"1406",linkClicks:"28",lpv:"23"},"2026-05-03":{adSpend:"433.35",impressions:"1205",reach:"1083",linkClicks:"34",lpv:"28"},"2026-05-04":{adSpend:"430.52",impressions:"1708",reach:"1528",linkClicks:"39",lpv:"33"},"2026-05-05":{adSpend:"526.36",impressions:"1230",reach:"1074",linkClicks:"41",lpv:"33"},"2026-05-06":{adSpend:"495.26",impressions:"1377",reach:"1205",linkClicks:"26",lpv:"23"},"2026-05-07":{adSpend:"438.34",impressions:"969",reach:"866",linkClicks:"27",lpv:"24"},"2026-05-08":{adSpend:"454.00",impressions:"1145",reach:"1029",linkClicks:"34",lpv:"27"},"2026-05-09":{adSpend:"358.93",impressions:"114",reach:"1018",linkClicks:"20",lpv:"21"},"2026-05-10":{adSpend:"213.00",impressions:"413",reach:"396",linkClicks:"7",lpv:"6"},"2026-05-11":{adSpend:"525.85",impressions:"1279",reach:"1198",linkClicks:"23",lpv:"13"},"2026-05-12":{adSpend:"619.00",impressions:"1604",reach:"721",linkClicks:"24",lpv:"23"},"2026-05-13":{adSpend:"662.12",impressions:"1721",reach:"1376",linkClicks:"81",lpv:"50"},"2026-05-14":{adSpend:"548.39",impressions:"1745",reach:"1446",linkClicks:"50",lpv:"41"}};

const SEED_PCT = {"2026-04-25":{qLink:"23.21%",qLPV:"26.84%",qDone:"100.00%",payI:"",payD:"0.00%",eF:"0.00%",eP:"8.33%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-04-26":{qLink:"18.00%",qLPV:"73.33%",qDone:"81.82%",payI:"",payD:"0.00%",eF:"33.33%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-04-27":{qLink:"37.14%",qLPV:"24.32%",qDone:"100.00%",payI:"",payD:"0.00%",eF:"11.11%",eP:"0.00%",pClk:"2.00%",pLPV:"2.70%",pQS:"11.11%",pQC:"11.11%"},"2026-04-28":{qLink:"40.63%",qLPV:"46.43%",qDone:"100.00%",payI:"",payD:"15.38%",eF:"61.54%",eP:"30.77%",pClk:"2.86%",pLPV:"3.57%",pQS:"7.69%",pQC:"7.69%"},"2026-04-29":{qLink:"12.50%",qLPV:"52.00%",qDone:"92.31%",payI:"",payD:"0.00%",eF:"25.00%",eP:"8.33%",pClk:"3.13%",pLPV:"4.00%",pQS:"7.69%",pQC:"8.33%"},"2026-04-30":{qLink:"20.51%",qLPV:"16.00%",qDone:"50.00%",payI:"25.00%",payD:"25.00%",eF:"0.00%",eP:"37.50%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-01":{qLink:"30.23%",qLPV:"27.59%",qDone:"61.54%",payI:"25.00%",payD:"12.50%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-02":{qLink:"21.43%",qLPV:"34.21%",qDone:"100.00%",payI:"15.38%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-03":{qLink:"14.71%",qLPV:"26.09%",qDone:"50.00%",payI:"16.67%",payD:"0.00%",eF:"33.33%",eP:"0.00%",pClk:"2.94%",pLPV:"3.57%",pQS:"20.00%",pQC:"20.00%"},"2026-05-04":{qLink:"15.38%",qLPV:"18.18%",qDone:"100.00%",payI:"20.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-05":{qLink:"17.07%",qLPV:"21.21%",qDone:"100.00%",payI:"0.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-06":{qLink:"26.92%",qLPV:"30.43%",qDone:"85.71%",payI:"0.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-07":{qLink:"29.63%",qLPV:"33.33%",qDone:"100.00%",payI:"0.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-08":{qLink:"29.41%",qLPV:"37.04%",qDone:"90.00%",payI:"10.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"2.94%",pLPV:"3.70%",pQS:"10.00%",pQC:"11.11%"},"2026-05-09":{qLink:"25.00%",qLPV:"23.81%",qDone:"80.00%",payI:"0.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-10":{qLink:"14.29%",qLPV:"16.67%",qDone:"100.00%",payI:"100.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-11":{qLink:"13.04%",qLPV:"23.08%",qDone:"100.00%",payI:"0.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-12":{qLink:"25.00%",qLPV:"26.09%",qDone:"100.00%",payI:"0.00%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"0.00%",pLPV:"4.35%",pQS:"16.67%",pQC:"16.67%"},"2026-05-13":{qLink:"19.75%",qLPV:"32.00%",qDone:"62.50%",payI:"12.50%",payD:"0.00%",eF:"0.00%",eP:"0.00%",pClk:"4.17%",pLPV:"0.00%",pQS:"0.00%",pQC:"0.00%"},"2026-05-14":{qLink:"28.00%",qLPV:"34.15%",qDone:"85.71%",payI:"7.14%",payD:"20.00%",eF:"0.00%",eP:"20.00%",pClk:"2.00%",pLPV:"2.44%",pQS:"7.14%",pQC:"8.33%"},"2026-05-15":{qLink:"",qLPV:"100.00%",qDone:"100.00%",payI:"20.00%",payD:"20.00%",eF:"0.00%",eP:"20.00%",pClk:"0.00%",pLPV:"0.00%",pQS:"20.00%",pQC:"20.00%"}};

// ─── CSV Parser (RFC 4180) ────────────────────────────────────────────────────
function parseFields(line) {
  const f=[]; let i=0;
  while(i<=line.length){
    if(i===line.length){f.push("");break;}
    if(line[i]==='"'){
      let v="";i++;
      while(i<line.length){
        if(line[i]==='"'&&line[i+1]==='"'){v+='"';i+=2;}
        else if(line[i]==='"'){i++;break;}
        else v+=line[i++];
      }
      f.push(v);if(line[i]===',')i++;
    } else {
      const e=line.indexOf(',',i);
      if(e===-1){f.push(line.slice(i));break;}
      f.push(line.slice(i,e));i=e+1;
    }
  }
  return f;
}
function parseCSV(text,filterFn){
  const lines=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n").trim().split("\n");
  const hdrs=parseFields(lines[0]);
  return lines.slice(1).filter(l=>l.trim()).map(line=>{
    const vals=parseFields(line),row={};
    hdrs.forEach((h,i)=>row[h]=(vals[i]||"").trim());
    return row;
  }).filter(filterFn||Boolean);
}

const gp=(obj,path)=>path&&obj?path.split(".").reduce((o,k)=>o==null?undefined:o[k],obj):undefined;
const calcDerived=m=>{const s=+m.adSpend||0,imp=+m.impressions||0,r=+m.reach||0,lc=+m.linkClicks||0,lpv=+m.lpv||0;return{gst:s*(1+GST),freq:r?imp/r:null,cpc:lc?s/lc:null,cpl:lpv?s/lpv:null,ctr:imp?(lc/imp)*100:null};};
const inRange=(d,dr)=>{if(!dr)return true;if(dr.from&&d<dr.from)return false;if(dr.to&&d>dr.to)return false;return true;};
const stepToStatus={"payment_successful":"Payment Successful","payment_initiated":"Payment Intiated","payment_dismissed":"Payment Dismissed","payment_abandoned":"Payment Abandoned"};

function computeTel(rawRows,date){
  const day=rawRows.filter(r=>(r.created_on||"").startsWith(date));
  if(!day.length)return null;
  const parsed=day.map(r=>{try{return{sid:r.session_id,p:JSON.parse(r.response||"{}")};}catch{return{sid:r.session_id,p:{}};}});
  const sid=fn=>new Set(parsed.filter(fn).map(x=>x.sid)).size;
  return{quizStarted:sid(({p})=>p.category==="QUIZ"),quizCompleted:sid(({p})=>p.category==="QUIZ"&&p.data?.quiz?.step===4),payInitiated:sid(({p})=>p.category==="PAYMENT"&&p.data?.step==="payment_initiated"),payDismissed:sid(({p})=>p.category==="PAYMENT"&&p.data?.step==="payment_dismissed"),paySuccessful:sid(({p})=>p.category==="PAYMENT"&&p.data?.step==="payment_successful")};
}

function schemaFP(rawRows){
  const combos=new Set();
  rawRows.slice(0,200).forEach(r=>{try{const p=JSON.parse(r.response||"{}");combos.add((p.category||"")+"|"+Object.keys(p.data||{}).sort().join(","));}catch{}});
  return[...combos].sort().join(";");
}
function sampleByCategory(rawRows){
  const by={};
  rawRows.forEach(r=>{try{const p=JSON.parse(r.response||"{}"),cat=p.category||"?";if(!by[cat])by[cat]=[];if(by[cat].length<4)by[cat].push(p);}catch{}});
  return by;
}
const DEFAULT_MAPPING={quizCategory:"QUIZ",quizStepPath:"data.quiz.step",quizAnswerPath:"data.quiz.answer",quizQuestionIdPath:"data.quiz.id",recCategory:"RECOMMENDATION_GENERATED",recNamePath:"data.categoryName",paymentCategory:"PAYMENT",paymentStepPath:"data.step",paymentPlanPath:"data.subscriptionId",paymentCategoryPath:"data.categoryName",userNamePath:"user.name",userMobilePath:"user.mobile",userAgeGroupPath:"user.ageGroup",utmPath:"utmDetails",telemetryCategory:"TELEMETRY",timeSpentTypePath:"data.type",timeSpentTypeValue:"TIME_SPENT",timeSpentSectionPath:"data.sectionId",timeSpentSecondsPath:"data.timeSpentSeconds",sectionIdToColumnMap:{},changes:[]};

async function fetchAIMapping(rawRows){
  const sample=JSON.stringify(sampleByCategory(rawRows),null,2).slice(0,10000);
  const prompt="Map these quiz funnel telemetry events to field paths. Return ONLY JSON (no markdown) with keys: quizCategory,quizStepPath,quizAnswerPath,quizQuestionIdPath,recCategory,recNamePath,paymentCategory,paymentStepPath,paymentPlanPath,paymentCategoryPath,userNamePath,userMobilePath,userAgeGroupPath,utmPath,telemetryCategory,timeSpentTypePath,timeSpentTypeValue,timeSpentSectionPath,timeSpentSecondsPath,sectionIdToColumnMap,changes.\n\nEvents:\n"+sample;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:2000,messages:[{role:"user",content:prompt}]})});
  const d=await res.json();
  const text=(d.content?.[0]?.text||"").split("```json").join("").split("```").join("").trim();
  return JSON.parse(text);
}

function buildSessions(rawRows,mapping,internalNums){
  const m=mapping||DEFAULT_MAPPING;
  const sessions={};
  rawRows.forEach(r=>{if(!r.session_id)return;if(!sessions[r.session_id])sessions[r.session_id]=[];try{const p=JSON.parse(r.response||"{}");sessions[r.session_id].push({r,p});}catch{}});
  return Object.entries(sessions).map(([sid,events])=>{
    const uEvt=events.find(e=>gp(e.p,m.userMobilePath));
    const utm=gp(events.find(e=>gp(e.p,m.utmPath))?.p,m.utmPath)||{};
    const answers={};
    events.filter(e=>e.p.category===m.quizCategory).forEach(e=>{const step=gp(e.p,m.quizStepPath);const ans=gp(e.p,m.quizAnswerPath);if(step!=null)answers[step]={answer:Array.isArray(ans)?ans.join(", "):(ans||"")};});
    const recEvt=events.find(e=>e.p.category===m.recCategory);
    const payEvts=events.filter(e=>e.p.category===m.paymentCategory).sort((a,b)=>["payment_successful","payment_initiated","payment_dismissed","payment_abandoned"].indexOf(gp(a.p,m.paymentStepPath)||"")-["payment_successful","payment_initiated","payment_dismissed","payment_abandoned"].indexOf(gp(b.p,m.paymentStepPath)||""));
    const payStep=gp(payEvts[0]?.p,m.paymentStepPath)||"";
    const payPlan=payEvts.reduce((f,e)=>f||gp(e.p,m.paymentPlanPath)||"","");
    const secMap=m.sectionIdToColumnMap||{};
    const timeSec={};
    events.forEach(e=>{
      if(e.p.category!==m.telemetryCategory)return;
      if(gp(e.p,m.timeSpentTypePath)!==m.timeSpentTypeValue)return;
      const secId=gp(e.p,m.timeSpentSectionPath);const secs=gp(e.p,m.timeSpentSecondsPath)||0;if(!secId)return;
      const col=secMap[secId]||("section_"+secId.replace(/-/g,"_")+"_time_seconds");
      timeSec[col]=(timeSec[col]||0)+secs;
    });
    const secVals=Object.values(timeSec).filter(v=>v>0);
    const date=events[0]?.r.created_on?.slice(0,10)||"";
    const dateObj=date?new Date(date):null;
    const quizDone=answers[4]!=null;
    const status=payStep?(stepToStatus[payStep]||payStep):(quizDone?"Quiz Completed":"");
    const mobile=gp(uEvt?.p,m.userMobilePath)||"";
    if(internalNums.includes(mobile.trim()))return null;
    return{session_id:sid,name:gp(uEvt?.p,m.userNamePath)||"",mobile,age_group:gp(uEvt?.p,m.userAgeGroupPath)||"",utm_source:utm.utm_source||"",utm_campaign:utm.utm_campaign||"",Datevalue:dateObj?dateObj.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"",_date:date,q1_answer:answers[1]?.answer||"",q2_answer:answers[2]?.answer||"",q3_answer:answers[3]?.answer||"",q4_answer:answers[4]?.answer||"",recommendation:gp(recEvt?.p,m.recNamePath)||"","Status for Analytics":status,payment_plan:payPlan,"Is Testing Number":"","Time Spent Less Than 2 Seconds":secVals.filter(v=>v<=2).length||"","Time Spent Greater Than 2 Seconds":secVals.filter(v=>v>2).length||"",...timeSec};
  }).filter(Boolean).filter(r=>r.name||r.recommendation).sort((a,b)=>a._date.localeCompare(b._date));
}

function buildCtx(rows,deps,quizSessions,dr){
  const dStr=deps.map(d=>d.date+": "+d.label).join("\n");
  const rStr=rows.filter(r=>(Object.values(r.meta).some(v=>v!=="")||r.tel)&&inRange(r.date,dr)).map(r=>{
    const dv=calcDerived(r.meta),t=r.tel,fl=deps.filter(d=>d.date===r.date).map(d=>d.label).join(", ");
    return r.date+(fl?" ["+fl+"]":"")+"\n  Meta: spend="+r.meta.adSpend+" imp="+r.meta.impressions+" reach="+r.meta.reach+" clicks="+r.meta.linkClicks+" lpv="+r.meta.lpv+"\n  CPC="+(dv.cpc?dv.cpc.toFixed(2):"-")+" CPL="+(dv.cpl?dv.cpl.toFixed(2):"-")+" CTR="+(dv.ctr?dv.ctr.toFixed(2):"-")+"%\n  Tel: quizStarted="+(t?.quizStarted??"-")+" quizDone="+(t?.quizCompleted??"-")+" payInit="+(t?.payInitiated??"-")+" payDismissed="+(t?.payDismissed??"-")+" payOK="+(t?.paySuccessful??"-");
  }).join("\n");
  let sessStr="";
  if(quizSessions&&quizSessions.length){
    const qs=quizSessions.filter(s=>inRange(s._date,dr));
    const paid=qs.filter(s=>s["Status for Analytics"]==="Payment Successful");
    const catCount={},catPaid={};
    qs.forEach(s=>{const c=s.recommendation||"?";catCount[c]=(catCount[c]||0)+1;if(s["Status for Analytics"]==="Payment Successful")catPaid[c]=(catPaid[c]||0)+1;});
    const catStr=Object.entries(catCount).sort((a,b)=>b[1]-a[1]).map(([c,n])=>c+":"+n+"sessions/"+(catPaid[c]||0)+"paid").join(", ");
    const goalCount={},intCount={},q4All={},q4Paid={};
    qs.forEach(s=>{if(s.q3_answer)goalCount[s.q3_answer]=(goalCount[s.q3_answer]||0)+1;if(s.q1_answer)intCount[s.q1_answer]=(intCount[s.q1_answer]||0)+1;(s.q4_answer||"").split(",").forEach(v=>{v=v.trim();if(v)q4All[v]=(q4All[v]||0)+1;});});
    paid.forEach(s=>{(s.q4_answer||"").split(",").forEach(v=>{v=v.trim();if(v)q4Paid[v]=(q4Paid[v]||0)+1;});});
    sessStr="\n\nSESSION INSIGHTS ("+qs.length+" sessions, "+paid.length+" paid):\nCategories: "+catStr+"\nTop goals: "+Object.entries(goalCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([g,n])=>g+":"+n).join(", ")+"\nTop interests: "+Object.entries(intCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([g,n])=>g+":"+n).join(", ")+"\nQ4 values (total/paid): "+Object.entries(q4All).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([v,n])=>v+":"+n+"/"+(q4Paid[v]||0)).join(", ");
  }
  return "You are an analytics assistant for WizKids Carnival Talent Pass — a digital national kids championship.\nFunnel: FB Ad > Landing Page > Quiz (4 Qs) > Recommendation > Pricing > Payment. LPV from Meta pixel.\n\nDeployments:\n"+dStr+"\n\nData:\n"+rStr+sessStr;
}

async function callClaude(system,user){
  try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:1000,system,messages:[{role:"user",content:user}]})});const d=await r.json();if(d.error)return"Error: "+d.error.message;return d.content?.[0]?.text||"";}catch(e){return"Error: "+e.message;}
}

function renderMd(text){
  if(!text)return null;
  return text.split(/(\*\*[^*]+\*\*)/).map((p,i)=>p.startsWith("**")&&p.endsWith("**")?<strong key={i}>{p.slice(2,-2)}</strong>:<span key={i}>{p}</span>);
}

const TH=(a="right",bg="#f5f2ee")=>({padding:"7px 8px",fontSize:10,fontWeight:600,color:"#9b9590",letterSpacing:"0.05em",textTransform:"uppercase",borderBottom:"1px solid #e8e3dc",background:bg,textAlign:a,whiteSpace:"nowrap",cursor:"pointer",userSelect:"none"});
const TD=(a="right",bg="#faf9f7")=>({padding:"6px 8px",borderBottom:"1px solid #f0ece6",textAlign:a,background:bg,whiteSpace:"nowrap",fontSize:11});
const BTN=(v="default")=>({background:v==="primary"?"#1a1a1a":"#f0ede8",color:v==="primary"?"#fff":"#1a1a1a",border:"none",borderRadius:6,padding:"6px 12px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"});
const INP={border:"1px solid #e8e3dc",borderRadius:5,padding:"5px 9px",fontSize:11,background:"#fff",color:"#1a1a1a",fontFamily:"inherit",outline:"none"};
const DPILL={background:"#f59e0b18",color:"#b45309",fontSize:9,fontWeight:600,padding:"2px 5px",borderRadius:3,display:"inline-block",marginTop:2,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"};
const STATUS_COLORS={s:{c:"#059669",b:"#f0fdf4"},i:{c:"#0369a1",b:"#f0f9ff"},d:{c:"#dc2626",b:"#fef2f2"},q:{c:"#6b6560",b:"#f5f2ee"}};
const scOf=s=>s==="Payment Successful"?STATUS_COLORS.s:s==="Payment Intiated"?STATUS_COLORS.i:(s||"").includes("Dismiss")||(s||"").includes("Abandon")?STATUS_COLORS.d:STATUS_COLORS.q;
const Q4L={"chance_to_be_among_indias_best":"India's best","local_to_national_leaderboard":"Leaderboard","medals_and_certificates":"Medals","personalized_feedback_report":"Feedback","school_recognition":"School rec.","showcase_your_childs_talent":"Showcase"};

function Spin(){return <span style={{display:"inline-block",width:12,height:12,border:"1.5px solid #e5e0d8",borderTopColor:"#1a1a1a",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>;}

const SESSION_COLS=[
  {key:"_date",label:"Date",tip:"Session date"},
  {key:"name",label:"Name",tip:"Parent name + mobile"},
  {key:"recommendation",label:"Category",tip:"Recommended talent category"},
  {key:"age_group",label:"Age",tip:"Child age group (age3_5 or age6_15)"},
  {key:"utm_source",label:"Source",tip:"Traffic source e.g. meta"},
  {key:"utm_campaign",label:"Campaign",tip:"UTM campaign name"},
  {key:"q1_answer",label:"Q1",tip:"What does your child love doing?"},
  {key:"q2_answer",label:"Q2",tip:"Specific type within interest area"},
  {key:"q3_answer",label:"Q3",tip:"What do you want most for your child?"},
  {key:"q4_answer",label:"Q4 Values",tip:"What matters most — multi-select"},
  {key:"Status for Analytics",label:"Status",tip:"Final session status"},
  {key:"payment_plan",label:"Plan",tip:"Subscription plan selected"},
  {key:"button_clicked",label:"Last CTA",tip:"Last button clicked before leaving"},
  {key:"Time Spent Less Than 2 Seconds",label:"<2s",tip:"Sections with ≤2s time spent (low enga"},
  {key:"Time Spent Greater Than 2 Seconds",label:">2s",tip:"Sections with >2s time spent (real eng"},
  {key:"page_recommendation_time_seconds",label:"Rec Pg",tip:"Time on recommendation results page"},
  {key:"section_tp-section-hero_time_seconds",label:"Hero",tip:"Time on hero/banner section"},
  {key:"section_tp-section-carousel_time_seconds",label:"Carousel",tip:"Time on result highlights carousel"},
  {key:"section_tp-section-video-player_time_seconds",label:"Video",tip:"Time watching video proof"},
  {key:"section_tp-section-why-enroll_time_seconds",label:"Why Enroll",tip:"Time on why-enroll section"},
  {key:"section_tp-section-deliverables_time_seconds",label:"Deliverables",tip:"Time on deliverables section"},
  {key:"section_tp-section-review_time_seconds",label:"Reviews",tip:"Time on testimonials/reviews"},
  {key:"section_tp-section-judges_time_seconds",label:"Judges",tip:"Time on expert judges section"},
  {key:"section_plans-section_time_seconds",label:"Plans",tip:"Time on plans overview"},
  {key:"section_tp-section-subscription-plan_time_seconds",label:"Sub Plan",tip:"Time on subscription/pricing cards"},
  {key:"section_tp-section-faq_time_seconds",label:"FAQ",tip:"Time on FAQ section"},
  {key:"page_membership_time_seconds",label:"Membership",tip:"Time on membership/pricing page"},
];

const PCT_COLS=[
  {key:"qLink",label:"Quiz/Link",hi:true,tip:"Quiz Started as % of Link Clicks"},
  {key:"qLPV",label:"Quiz/LPV",hi:true,tip:"Quiz Started as % of Landing Page Views"},
  {key:"qDone",label:"Quiz Done",tip:"Quiz Completed as % of Quiz Started"},
  {key:"payI",label:"Pay Init",tip:"Payment Initiated as % of Quiz Complet"},
  {key:"payD",label:"Pay Dismissed",tip:"Payment Dismissed as % of Payment Init"},
  {key:"eF",label:"Enroll Hero",tip:"Enroll Now (Hero button) click rate"},
  {key:"eP",label:"Enroll Price",tip:"Enroll Now (Price section) click rate"},
  {key:"pClk",label:"Pay/Clicks",hi:true,tip:"Payment Complete as % of Link Clicks"},
  {key:"pLPV",label:"Pay/LPV",hi:true,tip:"Payment Complete as % of Landing Page "},
  {key:"pQS",label:"Pay/Quiz",hi:true,tip:"Payment Complete as % of Quiz Starts"},
  {key:"pQC",label:"Pay/Done",hi:true,tip:"Payment Complete as % of Quiz Completed"},
];

const META_M=[{key:"adSpend",label:"Spend excl GST",pre:"₹"},{key:"impressions",label:"Impressions"},{key:"reach",label:"Reach"},{key:"linkClicks",label:"Link Clicks"},{key:"lpv",label:"LPV"}];
const META_D=[{key:"gst",label:"Spend incl GST",pre:"₹",dec:0},{key:"freq",label:"Frequency",dec:2},{key:"cpc",label:"Cost/Click",pre:"₹",dec:2},{key:"cpl",label:"Cost/Lead",pre:"₹",dec:2},{key:"ctr",label:"CTR",suf:"%",dec:2}];
const TEL_C=[{key:"quizStarted",label:"Quiz Started"},{key:"quizCompleted",label:"Quiz Done"},{key:"payInitiated",label:"Pay Init"},{key:"payDismissed",label:"Pay Dismissed"},{key:"paySuccessful",label:"Pay OK"}];

export default function App(){
  const [tab,setTab]=useState("table");
  const [rows,setRows]=useState(()=>DATES.map(date=>({date,meta:SEED_META[date]||{adSpend:"",impressions:"",reach:"",linkClicks:"",lpv:""},tel:null})));
  const [deps,setDeps]=useState(SEED_DEPS);
  const [mode,setMode]=useState("raw");
  const [editCell,setEditCell]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [csvLoading,setCsvLoading]=useState(false);
  const [mappingState,setMappingState]=useState(()=>{try{const c=localStorage.getItem("wkc_schema");return c?JSON.parse(c):null;}catch{return null;}});
  const [mappingLoading,setMappingLoading]=useState(false);
  const [mappingNote,setMappingNote]=useState("");
  const [recs,setRecs]=useState(null);
  const [recLoad,setRecLoad]=useState(false);
  const [expanded,setExpanded]=useState(null);
  const [comments,setComments]=useState({});
  const [commLoad,setCommLoad]=useState(false);
  const [qa,setQa]=useState([]);
  const [qaInput,setQaInput]=useState("");
  const [qaLoad,setQaLoad]=useState(false);
  const [depForm,setDepForm]=useState({show:false,date:"",label:""});
  const [quizRows,setQuizRows]=useState([]);
  const [qFilter,setQFilter]=useState({date:"all",rec:"all",status:"all"});
  const [qSearch,setQSearch]=useState("");
  const [qSort,setQSort]=useState({key:null,dir:1});
  const [internalNums,setInternalNums]=useState(()=>{try{return JSON.parse(localStorage.getItem("wkc_internal")||"null")||[];}catch{return[];}});
  const [showIntMgr,setShowIntMgr]=useState(false);
  const [newIntNum,setNewIntNum]=useState("");
  const [dateRange,setDateRange]=useState({from:"",to:""});
  const qaRef=useRef(null);
  const fileRef=useRef(null);

  const handleCSV=async e=>{
    const file=e.target.files[0];if(!file)return;
    setCsvLoading(true);setMappingNote("");
    const text=await file.text();
    const raw=parseCSV(text,r=>r.id||r.session_id);
    setRows(prev=>prev.map(r=>{const t=computeTel(raw,r.date);return t?{...r,tel:t}:r;}));
    const fp=schemaFP(raw);
    let mapping;
    if(mappingState&&mappingState.fp===fp){
      mapping=mappingState.mapping;
      setMappingNote("Schema unchanged — using cached mapping.");
    } else {
      setMappingLoading(true);
      setMappingNote("New schema detected — asking Claude to map fields...");
      try{
        mapping=await fetchAIMapping(raw);
        const changes=mapping.changes||[];
        const entry={fp,mapping};
        setMappingState(entry);
        try{localStorage.setItem("wkc_schema",JSON.stringify(entry));}catch{}
        setMappingNote(changes.length?"Schema updated. Changes: "+changes.join("; "):"Schema mapped — no structural changes.");
      }catch(err){
        mapping=DEFAULT_MAPPING;
        setMappingNote("AI mapping failed — using defaults. "+err.message);
      }
      setMappingLoading(false);
    }
    const sessions=buildSessions(raw,mapping,internalNums);
    setQuizRows(sessions);
    setRows(prev=>{genRecs(prev,deps,sessions);return prev;});
    setCsvLoading(false);e.target.value="";
  };

  const genRecs=async(currentRows,currentDeps,sessions)=>{
    setRecLoad(true);
    const ctx=buildCtx(currentRows,currentDeps,sessions||quizRows,dateRange);
    const result=await callClaude(ctx,'Return ONLY a JSON array of recommendation objects, no markdown.\nEach: {"type":"action"|"watch"|"anomaly","title":"max 8 words","detail":"2-3 sentences with specific dates/numbers"}\n6-8 items total.');
    try{setRecs(JSON.parse(result.split("```json").join("").split("```").join("").trim()));}
    catch{setRecs([{type:"action",title:"Analysis complete",detail:result}]);}
    setRecLoad(false);
  };

  const genComments=async()=>{
    setCommLoad(true);
    const ctx=buildCtx(rows,deps,quizRows,dateRange);
    const result=await callClaude(ctx,'For each date with data, write one sentence max 12 words. Return ONLY JSON: {"2026-05-03":"sentence"}');
    try{setComments(JSON.parse(result.split("```json").join("").split("```").join("").trim()));}catch{setComments({});}
    setCommLoad(false);
  };

  const sendQA=async()=>{
    const q=qaInput.trim();if(!q||qaLoad)return;
    setQaInput("");setQaLoad(true);
    setQa(h=>[...h,{role:"user",content:q}]);
    const ctx=buildCtx(rows,deps,quizRows,dateRange);
    const ans=await callClaude(ctx,q+"\n\nBe concise, 2-4 sentences. Bold **key numbers** only.");
    setQa(h=>[...h,{role:"assistant",content:ans}]);
    setQaLoad(false);
    setTimeout(()=>qaRef.current?.scrollTo({top:9e9,behavior:"smooth"}),80);
  };

  const commitEdit=()=>{if(!editCell)return;setRows(prev=>prev.map(r=>r.date===editCell.date?{...r,meta:{...r.meta,[editCell.field]:editVal}}:r));setEditCell(null);};
  const addIntNum=n=>{if(!n.trim())return;setInternalNums(prev=>{const next=[...new Set([...prev,n.trim()])];try{localStorage.setItem("wkc_internal",JSON.stringify(next));}catch{}return next;});setNewIntNum("");};
  const delIntNum=n=>{setInternalNums(prev=>{const next=prev.filter(x=>x!==n);try{localStorage.setItem("wkc_internal",JSON.stringify(next));}catch{}return next;});};
  const hasData=r=>Object.values(r.meta).some(v=>v!=="")||!!r.tel;
  const depForDate=d=>deps.filter(x=>x.date===d);
  const pctColor=v=>{if(!v||v==="0.00%")return"#ccc";const n=parseFloat(v);return n>=50?"#059669":n>=20?"#0369a1":n>=5?"#1a1a1a":"#6b6560";};

  const sortedQ=qSort.key?[...quizRows].sort((a,b)=>{const av=qSort.key==="_date"?(a._date||a.Datevalue||""):(a[qSort.key]||"");const bv=qSort.key==="_date"?(b._date||b.Datevalue||""):(b[qSort.key]||"");const an=parseFloat(av),bn=parseFloat(bv);if(!isNaN(an)&&!isNaN(bn))return(an-bn)*qSort.dir;return av.toString().localeCompare(bv.toString())*qSort.dir;}):quizRows;
  const filteredQ=sortedQ.filter(r=>{
    if(!inRange(r._date,dateRange))return false;
    if(qFilter.date!=="all"&&r.Datevalue!==qFilter.date)return false;
    if(qFilter.rec!=="all"&&r.recommendation!==qFilter.rec)return false;
    if(qFilter.status!=="all"&&(r["Status for Analytics"]||"Quiz Completed")!==qFilter.status)return false;
    if(qSearch){const q=qSearch.toLowerCase();if(!r.name?.toLowerCase().includes(q)&&!r.mobile?.includes(q)&&!r.recommendation?.toLowerCase().includes(q))return false;}
    return true;
  });
  const uniqueQDates=[...new Set(quizRows.map(r=>r.Datevalue).filter(Boolean))].sort();
  const ALL_RECS=["Build It!","Color Wizards","Dance Wizards","Handwriting Champs","Instrumental Genius","Master Orator","Recite It! - English","Singing Stars","Tell Ur Tale"];
  const ALL_STATS=["Quiz Completed","Payment Intiated","Payment Successful","Payment Dismissed","Payment Abandoned"];
  const TYPE_META={action:{label:"Action",color:"#1a1a1a",bg:"#f5f2ee",dot:"#1a1a1a"},watch:{label:"Watch",color:"#0369a1",bg:"#f0f9ff",dot:"#0369a1"},anomaly:{label:"Anomaly",color:"#b91c1c",bg:"#fef2f2",dot:"#b91c1c"}};

  return(
    <div style={{background:"#faf9f7",minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",color:"#1a1a1a",fontSize:13}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fu{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}.fu{animation:fu .2s ease}button:hover{opacity:.8}.ed:hover{background:#fffbf2!important;cursor:text}.rh:hover td{background:#f7f5f0!important}*{box-sizing:border-box}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#d5d0c8;border-radius:2px}textarea{resize:none;font-family:inherit}`}</style>

      {/* Header */}
      <div style={{background:"#faf9f7",borderBottom:"1px solid #e8e3dc",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontSize:14,fontWeight:600,letterSpacing:"-0.02em"}}>WizKids Carnival</span>
          <span style={{fontSize:11,color:"#9b9590"}}>Talent Pass Analytics</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#f0ede8",borderRadius:6,padding:"4px 10px"}}>
            <span style={{fontSize:10,color:"#9b9590"}}>From</span>
            <input type="date" value={dateRange.from} onChange={e=>setDateRange(r=>({...r,from:e.target.value}))} style={{border:"none",background:"transparent",fontSize:11,color:"#1a1a1a",outline:"none",fontFamily:"inherit",cursor:"pointer"}}/>
            <span style={{fontSize:10,color:"#9b9590"}}>To</span>
            <input type="date" value={dateRange.to} onChange={e=>setDateRange(r=>({...r,to:e.target.value}))} style={{border:"none",background:"transparent",fontSize:11,color:"#1a1a1a",outline:"none",fontFamily:"inherit",cursor:"pointer"}}/>
            {(dateRange.from||dateRange.to)&&<span onClick={()=>setDateRange({from:"",to:""})} style={{fontSize:12,color:"#9b9590",cursor:"pointer"}}>✕</span>}
          </div>
          <label style={{...BTN(),cursor:(csvLoading||mappingLoading)?"default":"pointer",display:"flex",alignItems:"center",gap:5}}>
            {(csvLoading||mappingLoading)?<Spin/>:<span>↑</span>}
            {mappingLoading?"Mapping...":(csvLoading?"Processing...":"Upload CSV")}
            <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleCSV} disabled={csvLoading||mappingLoading}/>
          </label>
        </div>
      </div>

      {/* Mapping note */}
      {mappingNote&&<div style={{padding:"7px 20px",background:mappingNote.includes("Changes")||mappingNote.includes("failed")?"#fef9ec":"#f0fdf8",borderBottom:"1px solid #e8e3dc",fontSize:11,color:mappingNote.includes("failed")?"#b91c1c":mappingNote.includes("Changes")?"#92400e":"#065f46",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{mappingNote.includes("Changes")?"⚠ ":mappingNote.includes("failed")?"✕ ":"✓ "}{mappingNote}</span>
        <span onClick={()=>setMappingNote("")} style={{cursor:"pointer",color:"#9b9590",marginLeft:12}}>✕</span>
      </div>}

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #e8e3dc",padding:"0 20px",background:"#faf9f7"}}>
        {[["table","Data Table"],["sessions","Quiz Sessions"],["recs","Recommendations"],["qa","Ask AI"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",padding:"12px 0",marginRight:24,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",color:tab===k?"#1a1a1a":"#9b9590",borderBottom:tab===k?"2px solid #1a1a1a":"2px solid transparent",transition:"all .15s"}}>{l}</button>
        ))}
      </div>

      {/* DATA TABLE */}
      {tab==="table"&&<div style={{padding:20}}>
        {csvLoading&&<div style={{background:"#fff",border:"1px solid #e8e3dc",borderRadius:8,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10,color:"#9b9590",fontSize:12}}><Spin/> Processing CSV...</div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:8,flexWrap:"wrap"}}>
          <div><div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Daily Funnel</div><div style={{fontSize:11,color:"#9b9590"}}>Click Meta cells to edit · Upload CSV for telemetry</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{display:"flex",background:"#f0ede8",borderRadius:6,padding:2}}>
              {[["raw","Raw"],["%","%"]].map(([v,l])=><button key={v} onClick={()=>setMode(v)} style={{background:mode===v?"#fff":"transparent",border:"none",borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit",color:mode===v?"#1a1a1a":"#9b9590",boxShadow:mode===v?"0 1px 2px #0001":"none"}}>{l}</button>)}
            </div>
            <button style={BTN()} onClick={genComments} disabled={commLoad}>{commLoad?<Spin/>:"✦ AI Comments"}</button>
            <button style={BTN()} onClick={()=>setDepForm(f=>({...f,show:!f.show}))}>+ Deploy</button>
          </div>
        </div>

        {depForm.show&&<div className="fu" style={{background:"#fff",border:"1px solid #e8e3dc",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input value={depForm.date} onChange={e=>setDepForm(f=>({...f,date:e.target.value}))} placeholder="2026-05-20" style={{...INP,width:110,fontFamily:"monospace"}}/>
          <input value={depForm.label} onChange={e=>setDepForm(f=>({...f,label:e.target.value}))} placeholder="What changed?" style={{...INP,width:200}}/>
          <button style={BTN("primary")} onClick={()=>{if(depForm.date&&depForm.label){setDeps(d=>[...d,{date:depForm.date,label:depForm.label}]);setDepForm({show:false,date:"",label:""});}}}>Add</button>
          <button style={BTN()} onClick={()=>setDepForm(f=>({...f,show:false}))}>Cancel</button>
        </div>}

        <div style={{overflowX:"auto",border:"1px solid #e8e3dc",borderRadius:8,background:"#fff",maxHeight:"calc(100vh - 220px)",overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead style={{position:"sticky",top:0,zIndex:5}}>
              <tr>
                <th style={{...TH("left"),position:"sticky",left:0,zIndex:6,minWidth:90}}>Date</th>
                {mode==="raw"&&<>{META_M.map(c=><th key={c.key} style={TH("right","#fffbf0")}>{c.label}</th>)}{META_D.map(c=><th key={c.key} style={TH("right")}>{c.label}</th>)}{TEL_C.map(c=><th key={c.key} style={TH("right","#f0fdf8")}>{c.label}</th>)}<th style={{...TH("left"),minWidth:160}}>AI Note</th></>}
                {mode==="%"&&PCT_COLS.map(c=><th key={c.key} title={c.tip} style={TH("right",c.hi?"#fffbf0":"#f5f2ee")}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.filter(row=>inRange(row.date,dateRange)).map(row=>{
                const dv=calcDerived(row.meta),rdeps=depForDate(row.date),noData=!hasData(row);
                const isEd=f=>editCell?.date===row.date&&editCell?.field===f;
                return(
                  <tr key={row.date} className="rh" style={{opacity:noData?.35:1}}>
                    <td style={{...TD("left","#faf9f7"),position:"sticky",left:0,zIndex:1,fontFamily:"monospace",fontSize:10}}>
                      <div style={{color:rdeps.length?"#b45309":"#6b6560",fontWeight:rdeps.length?600:400}}>{row.date.slice(5)}</div>
                      {rdeps.map((d,i)=><div key={i} style={DPILL}>&#9873; {d.label}</div>)}
                    </td>
                    {mode==="raw"&&<>
                      {META_M.map(c=>(
                        <td key={c.key} className="ed" style={TD("right","#fffbf5")} onClick={()=>{setEditCell({date:row.date,field:c.key});setEditVal(row.meta[c.key]);}}>
                          {isEd(c.key)?<input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={e=>{if(e.key==="Enter")commitEdit();if(e.key==="Escape")setEditCell(null);}} style={{border:"1px solid #1a1a1a",borderRadius:3,padding:"2px 5px",fontSize:11,width:75,textAlign:"right",outline:"none",fontFamily:"monospace"}}/>:<span style={{color:row.meta[c.key]?"#1a1a1a":"#ccc",fontFamily:"monospace"}}>{row.meta[c.key]?(c.pre||"")+row.meta[c.key]:"—"}</span>}
                        </td>
                      ))}
                      {META_D.map(c=><td key={c.key} style={TD("right","#f9f7f4")}><span style={{color:dv[c.key]?"#6b6560":"#d5d0c8",fontFamily:"monospace"}}>{dv[c.key]!=null?(c.pre||"")+(+dv[c.key]).toFixed(c.dec||0)+(c.suf||""):"—"}</span></td>)}
                      {TEL_C.map(c=>{const v=row.tel?.[c.key];return<td key={c.key} style={TD("right","#f7fdfb")}><span style={{fontFamily:"monospace",color:v==null?"#d5d0c8":c.key==="paySuccessful"&&v>0?"#059669":v>0?"#1a1a1a":"#ccc",fontWeight:c.key==="paySuccessful"&&v>0?600:400}}>{v??"-"}</span></td>;})}
                      <td style={TD("left")}>
                        {comments[row.date]?<span style={{color:"#6b6560",lineHeight:1.5,fontSize:10}}>{comments[row.date]}</span>:commLoad?<Spin/>:hasData(row)?<span style={{color:"#ccc",fontSize:10,cursor:"pointer"}} onClick={async()=>{const ctx=buildCtx(rows,deps,quizRows,dateRange);const c=await callClaude(ctx,"For "+row.date+" only: one sentence about performance. Note any deployment.");setComments(p=>({...p,[row.date]:c}));}}>generate</span>:null}
                      </td>
                    </>}
                    {mode==="%"&&PCT_COLS.map(c=>{const pct=SEED_PCT[row.date]||{};const v=pct[c.key]||"";return<td key={c.key} style={TD("right",c.hi?"#fffbf5":"#faf9f7")}><span style={{fontFamily:"monospace",color:pctColor(v),fontWeight:c.hi&&v&&v!=="0.00%"?500:400}}>{v||"—"}</span></td>;})}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>}

      {/* QUIZ SESSIONS */}
      {tab==="sessions"&&<div style={{padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:8,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Quiz Sessions</div>
            <div style={{fontSize:11,color:"#9b9590"}}>{quizRows.length>0?filteredQ.length+" of "+quizRows.length+" sessions":"Upload CSV to populate"}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button style={BTN()} onClick={()=>setShowIntMgr(v=>!v)}>&#8856; Internal ({internalNums.length})</button>
            <div style={{fontSize:11,color:"#9b9590",padding:"6px 10px",background:"#f5f2ee",borderRadius:6,display:"flex",alignItems:"center"}}>Populated from Telemetry CSV ↑</div>
          </div>
        </div>

        {showIntMgr&&<div className="fu" style={{background:"#fff",border:"1px solid #e8e3dc",borderRadius:8,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Internal / Test Numbers</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {internalNums.map(n=><span key={n} style={{background:"#f5f2ee",borderRadius:4,padding:"3px 7px",fontSize:11,display:"flex",alignItems:"center",gap:5}}>{n}<span onClick={()=>delIntNum(n)} style={{cursor:"pointer",color:"#dc2626",fontWeight:700}}>×</span></span>)}
            {!internalNums.length&&<span style={{color:"#9b9590",fontSize:11}}>None added</span>}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={newIntNum} onChange={e=>setNewIntNum(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addIntNum(newIntNum);}} placeholder="Add mobile number..." style={{...INP,width:180,fontFamily:"monospace"}}/>
            <button style={BTN("primary")} onClick={()=>addIntNum(newIntNum)}>Add</button>
          </div>
          <div style={{fontSize:10,color:"#9b9590",marginTop:6}}>Excluded from all tables and AI context. Saved in browser storage.</div>
        </div>}

        {quizRows.length>0&&<div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          <input value={qSearch} onChange={e=>setQSearch(e.target.value)} placeholder="Search name / mobile..." style={{...INP,width:160}}/>
          <select value={qFilter.date} onChange={e=>setQFilter(f=>({...f,date:e.target.value}))} style={{...INP,cursor:"pointer"}}><option value="all">All dates</option>{uniqueQDates.map(d=><option key={d} value={d}>{d}</option>)}</select>
          <select value={qFilter.rec} onChange={e=>setQFilter(f=>({...f,rec:e.target.value}))} style={{...INP,cursor:"pointer"}}><option value="all">All categories</option>{ALL_RECS.map(r=><option key={r} value={r}>{r}</option>)}</select>
          <select value={qFilter.status} onChange={e=>setQFilter(f=>({...f,status:e.target.value}))} style={{...INP,cursor:"pointer"}}><option value="all">All statuses</option>{ALL_STATS.map(s=><option key={s} value={s}>{s}</option>)}</select>
          {(qFilter.date!=="all"||qFilter.rec!=="all"||qFilter.status!=="all"||qSearch)&&<button style={BTN()} onClick={()=>{setQFilter({date:"all",rec:"all",status:"all"});setQSearch("");}}>Clear</button>}
        </div>}

        {quizRows.length===0?<div style={{background:"#fff",border:"1px solid #e8e3dc",borderRadius:8,padding:40,textAlign:"center",color:"#9b9590"}}>Upload the telemetry CSV to populate sessions.</div>:
        <div style={{overflowX:"auto",border:"1px solid #e8e3dc",borderRadius:8,background:"#fff",maxHeight:"calc(100vh - 260px)",overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead style={{position:"sticky",top:0,zIndex:5}}>
              <tr>
                {SESSION_COLS.map((col,ci)=>{
                  const isTime=col.key.includes("_time_seconds")||col.key==="page_membership_time_seconds";
                  const bg=isTime?"#f0fdf8":col.key==="Status for Analytics"||col.key==="payment_plan"?"#fffbf0":"#f5f2ee";
                  const sorted=qSort.key===col.key;
                  return<th key={col.key} title={col.tip} onClick={()=>setQSort(s=>s.key===col.key?{key:col.key,dir:-s.dir}:{key:col.key,dir:1})} style={{...TH(isTime?"right":"left",bg),position:ci===0?"sticky":undefined,left:ci===0?0:undefined,zIndex:ci===0?6:undefined,minWidth:ci===0?80:undefined}}>
                    <div style={{display:"flex",alignItems:"center",gap:2,justifyContent:isTime?"flex-end":"flex-start"}}>
                      {col.label}<span style={{color:sorted?"#1a1a1a":"#ccc",fontSize:8}}>{sorted?(qSort.dir===1?"▲":"▼"):"⇅"}</span>
                    </div>
                    <div style={{fontSize:9,fontWeight:400,color:"#b8b4aa",marginTop:1,whiteSpace:"normal",maxWidth:100,lineHeight:1.3}}>{col.tip}</div>
                  </th>;
                })}
              </tr>
            </thead>
            <tbody>
              {filteredQ.map((row,i)=>{
                const status=row["Status for Analytics"]||"Quiz Completed";
                const sc=scOf(status);
                const q4=(row.q4_answer||"").split(",").map(v=>Q4L[v.trim()]||v.trim()).filter(Boolean);
                return<tr key={i} className="rh">
                  {SESSION_COLS.map((col,ci)=>{
                    const isTime=col.key.includes("_time_seconds")||col.key==="page_membership_time_seconds";
                    if(col.key==="_date")return<td key={col.key} style={{...TD("left","#faf9f7"),position:"sticky",left:0,zIndex:1,fontFamily:"monospace",fontSize:10}}>{(row.Datevalue||row._date||"").replace(", 2026","").replace("April","Apr")}</td>;
                    if(col.key==="name")return<td key={col.key} style={TD("left")}><div style={{fontWeight:500}}>{row.name||"—"}</div><div style={{fontSize:10,color:"#9b9590",fontFamily:"monospace"}}>{row.mobile}</div></td>;
                    if(col.key==="recommendation")return<td key={col.key} style={TD("left")}><span style={{background:"#f0ede8",borderRadius:4,padding:"2px 5px",fontSize:10,fontWeight:600,whiteSpace:"nowrap"}}>{row.recommendation||"—"}</span></td>;
                    if(col.key==="age_group")return<td key={col.key} style={{...TD("left"),fontSize:10,color:"#9b9590"}}>{row.age_group==="age6_15"?"6–15":row.age_group==="age3_5"?"3–5":row.age_group||"—"}</td>;
                    if(col.key==="q4_answer")return<td key={col.key} style={{...TD("left"),maxWidth:150}}><div style={{display:"flex",flexWrap:"wrap",gap:2}}>{q4.length?q4.map((v,j)=><span key={j} style={{background:"#f0ede8",borderRadius:3,padding:"1px 4px",fontSize:9,whiteSpace:"nowrap"}}>{v}</span>):"—"}</div></td>;
                    if(col.key==="Status for Analytics")return<td key={col.key} style={TD("left","#fffbf5")}><span style={{background:sc.b,color:sc.c,borderRadius:4,padding:"2px 5px",fontSize:10,fontWeight:500,whiteSpace:"nowrap"}}>{status}</span></td>;
                    if(col.key==="payment_plan")return<td key={col.key} style={{...TD("left"),fontSize:10,color:"#6b6560"}}>{(row[col.key]||"—").replace("Talent Pass ","").replace(/-flow/,"").replace(/-/g," ")}</td>;
                    if(isTime)return<td key={col.key} style={TD("right","#f7fdfb")}><span style={{fontFamily:"monospace",color:row[col.key]&&row[col.key]!=="0"?"#1a1a1a":"#ccc"}}>{row[col.key]||"—"}</span></td>;
                    const v=row[col.key]||"";return<td key={col.key} style={TD("left")}><span style={{color:v?"#1a1a1a":"#ccc"}}>{v||"—"}</span></td>;
                  })}
                </tr>;
              })}
            </tbody>
          </table>
        </div>}
      </div>}

      {/* RECOMMENDATIONS */}
      {tab==="recs"&&<div style={{padding:20,maxWidth:660}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div><div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Recommendations</div><div style={{fontSize:11,color:"#9b9590"}}>Auto-generated after CSV upload · Click card to expand</div></div>
          <button style={BTN("primary")} onClick={()=>genRecs(rows,deps,quizRows)} disabled={recLoad}>{recLoad?<Spin/>:"Regenerate"}</button>
        </div>
        {recLoad&&<div style={{background:"#fff",border:"1px solid #e8e3dc",borderRadius:8,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,color:"#9b9590",fontSize:12}}><Spin/> Analysing...</div>}
        {!recs&&!recLoad&&<div style={{background:"#fff",border:"1px solid #e8e3dc",borderRadius:8,padding:36,textAlign:"center",color:"#9b9590",fontSize:12}}>Upload a CSV or click Regenerate.</div>}
        {recs&&!recLoad&&["action","watch","anomaly"].map(type=>{
          const items=(Array.isArray(recs)?recs:[]).filter(r=>r.type===type);if(!items.length)return null;
          const m=TYPE_META[type]||TYPE_META.action;
          return<div key={type} style={{marginBottom:18}}>
            <div style={{fontSize:10,fontWeight:600,color:"#9b9590",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:6}}>{m.label}</div>
            {items.map((item,idx)=>{const key=type+"-"+idx;const open=expanded===key;return<div key={key} className="fu" onClick={()=>setExpanded(open?null:key)} style={{background:open?m.bg:"#fff",border:"1px solid "+(open?m.color+"33":"#e8e3dc"),borderRadius:7,marginBottom:5,cursor:"pointer",transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:m.dot,flexShrink:0}}/>
                <span style={{flex:1,fontSize:12,fontWeight:500}}>{item.title}</span>
                <span style={{fontSize:10,color:"#9b9590"}}>{open?"▲":"▼"}</span>
              </div>
              {open&&<div style={{padding:"0 12px 10px 26px",fontSize:12,color:"#4a4540",lineHeight:1.7,borderTop:"1px solid #f0ece6"}}><div style={{paddingTop:8}}>{renderMd(item.detail)}</div></div>}
            </div>;})}
          </div>;
        })}
        <div style={{marginTop:24,paddingTop:18,borderTop:"1px solid #f0ece6"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#9b9590",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Deployment Log</div>
          {deps.map((d,i)=><div key={i} style={{display:"flex",gap:12,paddingBottom:6,marginBottom:6,borderBottom:"1px solid #f7f4f0",alignItems:"baseline"}}>
            <div style={{fontFamily:"monospace",fontSize:10,color:"#9b9590",minWidth:72}}>{d.date}</div>
            <div style={{fontSize:12,color:"#4a4540"}}>{d.label}</div>
          </div>)}
        </div>
      </div>}

      {/* ASK AI */}
      {tab==="qa"&&<div style={{padding:20,maxWidth:700,display:"flex",flexDirection:"column",height:"calc(100vh - 108px)"}}>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Ask AI</div>
          <div style={{fontSize:11,color:"#9b9590"}}>Full context: funnel data, telemetry, sessions, deployments{dateRange.from||dateRange.to?" · filtered by date range":""}</div>
        </div>
        <div ref={qaRef} style={{flex:1,overflowY:"auto",marginBottom:12}}>
          {qa.length===0&&<div>{<div style={{fontSize:11,color:"#9b9590",marginBottom:8}}>Suggested</div>}{["Which page change had the biggest impact on quiz start rate?","What is the trend in cost per lead?","Which days had the best payment conversion?","What do buyers have in common in their quiz answers?","Are there any anomalies I should know about?"].map((q,i)=><div key={i} onClick={()=>setQaInput(q)} style={{padding:"9px 12px",marginBottom:5,background:"#fff",border:"1px solid #e8e3dc",borderRadius:6,cursor:"pointer",fontSize:12,color:"#1a1a1a"}} onMouseOver={e=>e.currentTarget.style.background="#f5f2ee"} onMouseOut={e=>e.currentTarget.style.background="#fff"}>{q}</div>)}</div>}
          {qa.map((msg,i)=><div key={i} className="fu" style={{marginBottom:8,padding:"10px 12px",background:msg.role==="user"?"#f5f2ee":"#fff",border:"1px solid #e8e3dc",borderLeft:msg.role==="assistant"?"3px solid #1a1a1a":"1px solid #e8e3dc",borderRadius:7,fontSize:12,lineHeight:1.7,color:"#1a1a1a"}}>
            <div style={{fontSize:9,fontWeight:600,color:"#9b9590",letterSpacing:"0.07em",marginBottom:4,textTransform:"uppercase"}}>{msg.role==="user"?"You":"Claude"}</div>
            {msg.role==="assistant"?renderMd(msg.content):msg.content}
          </div>)}
          {qaLoad&&<div style={{padding:"10px 12px",background:"#fff",border:"1px solid #e8e3dc",borderLeft:"3px solid #1a1a1a",borderRadius:7,display:"flex",alignItems:"center",gap:8,color:"#9b9590",fontSize:12}}><Spin/> Thinking...</div>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <textarea value={qaInput} onChange={e=>setQaInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendQA();}}} placeholder="Ask anything... (Enter to send)" rows={2} style={{flex:1,border:"1px solid #e8e3dc",borderRadius:7,padding:"9px 12px",fontSize:12,background:"#fff",color:"#1a1a1a",outline:"none"}}/>
          <button style={{...BTN("primary"),padding:"0 18px",alignSelf:"stretch"}} onClick={sendQA} disabled={qaLoad}>→</button>
        </div>
      </div>}
    </div>
  );
}
