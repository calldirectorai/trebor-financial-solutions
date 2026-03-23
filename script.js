(function(){
  var params=new URLSearchParams(window.location.search);
  var fields={};
  var paramMap={
    'first_name':'firstName','last_name':'lastName','full_name':'fullName',
    'email':'email','phone':'phone','company':'company',
    'city':'city','state':'state','country':'country'
  };
  var skipTags={'SCRIPT':1,'STYLE':1,'NOSCRIPT':1,'TEXTAREA':1,'CODE':1,'PRE':1};
  var hasUrlFields=false;
  for(var p in paramMap){
    var v=params.get(p);
    if(v){fields[paramMap[p]]=v;hasUrlFields=true;}
  }
  var contactId=params.get('contact_id');
  function esc(s){
    if(!s)return s;
    var d=document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }
  function doReplace(data){
    var r={};
    r['{{full_name}}']=esc(((data.firstName||'')+' '+(data.lastName||'')).trim()||((data.fullName||data.name)||''));
    r['{{first_name}}']=esc(data.firstName||(data.name?data.name.split(' ')[0]:'')||'');
    r['{{last_name}}']=esc(data.lastName||(data.name&&data.name.indexOf(' ')>-1?data.name.substring(data.name.indexOf(' ')+1):'')||'');
    r['{{email}}']=esc(data.email||'');
    r['{{phone}}']=esc(data.phone||'');
    r['{{company}}']=esc(data.company||'');
    r['{{city}}']=esc(data.city||'');
    r['{{state}}']=esc(data.state||'');
    r['{{country}}']=esc(data.country||'');
    r['{{date}}']=new Date().toLocaleDateString();
    r['{{time}}']=new Date().toLocaleTimeString();
    r['{{location}}']=[data.city,data.state,data.country].filter(Boolean).join(', ');
    r['{{tracking_id}}']=esc(data.trackingId||'');
    r['{{lastClickedProduct}}']=esc(data.lastClickedProduct||'');
    r['{{lastProductClickDate}}']=esc(data.lastProductClickDate||'');
    r['{{lastClickedProductPrice}}']=esc(data.lastClickedProductPrice||'');
    r['{{lastClickedProductURL}}']=esc(data.lastClickedProductURL||'');
    r['{{productsClickedCount}}']=esc(data.productsClickedCount||'0');
    r['{{ip_address}}']=esc(data.ipAddress||'');
    r['{{ip}}']=esc(data.ipAddress||'');
    if(data.customFields){
      for(var k in data.customFields){
        r['{{'+k+'}}']=esc(String(data.customFields[k]||''));
      }
    }
    params.forEach(function(v,k){
      if(!paramMap[k]&&k!=='contact_id'&&k!=='page_id'&&k.indexOf('utm_')!==0){
        r['{{'+k+'}}']=esc(v);
      }
    });
    var hasValues=false;
    for(var key in r){if(r[key]){hasValues=true;break;}}
    if(!hasValues)return;
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        var p=n.parentNode;
        if(p&&skipTags[p.nodeName])return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while(node=walker.nextNode()){
      var txt=node.nodeValue;
      if(txt&&txt.indexOf('{{')>-1){
        var changed=txt;
        for(var ph in r){
          if(r[ph]&&changed.indexOf(ph)>-1){
            changed=changed.split(ph).join(r[ph]);
          }
        }
        if(changed!==txt)node.nodeValue=changed;
      }
    }
    var attrs=['value','placeholder','content','alt','title'];
    attrs.forEach(function(attr){
      var els=document.querySelectorAll('['+attr+'*="{{"]');
      for(var i=0;i<els.length;i++){
        var tag=els[i].tagName;
        if(skipTags[tag])continue;
        var val=els[i].getAttribute(attr);
        if(val){
          var nv=val;
          for(var ph in r){
            if(r[ph]&&nv.indexOf(ph)>-1){
              nv=nv.split(ph).join(r[ph]);
            }
          }
          if(nv!==val)els[i].setAttribute(attr,nv);
        }
      }
    });
  }
  function run(){
    if(contactId){
      var xhr=new XMLHttpRequest();
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=2369');
      xhr.onload=function(){
        if(xhr.status===200){
          try{
            var resp=JSON.parse(xhr.responseText);
            if(resp.success&&resp.contact){
              var merged=resp.contact;
              for(var k in fields){merged[k]=fields[k];}
              doReplace(merged);
              return;
            }
          }catch(e){}
        }
        if(hasUrlFields)doReplace(fields);
      };
      xhr.onerror=function(){if(hasUrlFields)doReplace(fields);};
      xhr.send();
    }else if(hasUrlFields){
      doReplace(fields);
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}
  else{run();}
})();

(function(){
  var slug='9CyxCu2j6X';
  var apiBase='https://paymegpt.com';
  function findEmail(){
    var ids=['email','emailAddress','buyer-email','buyerEmail','user-email','userEmail','checkout-email','customer-email','contact-email'];
    for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&el.value&&el.value.includes('@'))return el.value.trim();}
    var inputs=document.querySelectorAll('input[type="email"],input[name*="email"],input[placeholder*="email"],input[placeholder*="Email"]');
    for(var j=0;j<inputs.length;j++){if(inputs[j].value&&inputs[j].value.includes('@'))return inputs[j].value.trim();}
    return '';
  }
  function findName(){
    var ids=['name','fullName','full-name','buyer-name','buyerName','customer-name','userName','user-name'];
    for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&el.value)return el.value.trim();}
    var inputs=document.querySelectorAll('input[name*="name"]:not([name*="email"]):not([type="email"]),input[placeholder*="name"]:not([placeholder*="email"]):not([type="email"]),input[placeholder*="Name"]:not([type="email"])');
    for(var j=0;j<inputs.length;j++){if(inputs[j].value)return inputs[j].value.trim();}
    return '';
  }
  var __realProcessPayment=function(a,b,c,d,e){
    var amountCents,email,productName,productDescription,customerName,quantity;
    if(a&&typeof a==='object'){
      amountCents=a.amountCents;email=a.email;productName=a.productName;
      productDescription=a.productDescription||'';customerName=a.name||'';quantity=a.quantity||1;
    }else{
      amountCents=typeof a==='number'?a:0;productName=typeof b==='string'?b:'';
      productDescription=typeof c==='string'?c:'';email='';customerName='';quantity=1;
    }
    if(!email)email=findEmail();
    if(!customerName)customerName=findName();
    if(!productName){alert('Product name is required.');return Promise.reject('no_product_name');}
    if(!amountCents||amountCents<100){alert('Amount must be at least $1.00');return Promise.reject('invalid_amount');}
    if(!email){alert('Please enter your email address.');return Promise.reject('no_email');}
    var successBase=window.location.href.split('?')[0];
    return fetch(apiBase+'/api/landing-pages/public/'+slug+'/payment/checkout',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:email,name:customerName,amountCents:amountCents,productName:productName,productDescription:productDescription,quantity:quantity,successUrl:successBase+'?payment=success&product='+encodeURIComponent(productName)+'&session_id={CHECKOUT_SESSION_ID}',cancelUrl:successBase+'?payment=cancelled'})
    }).then(function(r){return r.json();}).then(function(d){
      if(d.checkoutUrl){window.location.href=d.checkoutUrl;}
      else{alert(d.error||'Failed to process payment');throw new Error(d.error);}
    });
  };
  Object.defineProperty(window,'__processPayment',{value:__realProcessPayment,writable:false,configurable:false});
  document.addEventListener('DOMContentLoaded',function(){
    var urlParams=new URLSearchParams(window.location.search);
    if(urlParams.get('payment')==='success'){
      var pName=urlParams.get('product')||'your item';
      var overlay=document.createElement('div');overlay.id='payment-success-overlay';
      overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,-apple-system,sans-serif;';
      overlay.innerHTML='<div style="background:white;border-radius:16px;padding:40px;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Payment Successful!</h2><p style="margin:0 0 24px;color:#6b7280;font-size:16px;">Thank you for purchasing '+pName.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'.</p><button onclick="document.getElementById(\'payment-success-overlay\').remove();window.history.replaceState({},\'\',window.location.pathname);" style="padding:12px 32px;font-size:16px;font-weight:600;background:#16a34a;color:white;border:none;border-radius:8px;cursor:pointer;">Continue</button></div>';
      document.body.appendChild(overlay);
    }
  });
})();

let currentPage='home';
function navigateTo(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const t=document.getElementById('page-'+page);if(t)t.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l=>{l.classList.toggle('active',l.dataset.page===page)});
  document.querySelectorAll('.mm-link').forEach(l=>{l.classList.toggle('active',l.dataset.page===page)});
  currentPage=page;window.scrollTo({top:0,behavior:'smooth'});setTimeout(initReveals,150);
}
function toggleMenu(){const h=document.getElementById('hamburger'),m=document.getElementById('mobileMenu');h.classList.toggle('open');m.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':''}
function closeMenu(){document.getElementById('hamburger').classList.remove('open');document.getElementById('mobileMenu').classList.remove('open');document.body.style.overflow=''}
window.addEventListener('scroll',()=>{document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>40);document.getElementById('scrollTop').classList.toggle('show',window.scrollY>400)});
function initReveals(){
  const obs=new IntersectionObserver((entries)=>{entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*70);obs.unobserve(e.target)}})},{threshold:0.06,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.page.active .fu:not(.visible),.page.active .fu-left:not(.visible),.page.active .fu-right:not(.visible),.page.active .fu-scale:not(.visible)').forEach(el=>obs.observe(el));
}
function submitHeroForm(){
  const n=document.getElementById('hfName').value.trim(),p=document.getElementById('hfPhone').value.trim(),e=document.getElementById('hfEmail').value.trim(),s=document.getElementById('hfService').value;
  if(!n||!p||!e){alert('Please fill in your name, phone, and email.');return}
  const btn=document.getElementById('heroFormBtn');btn.disabled=true;btn.textContent='Sending...';
  const payload={contactPhone:p,contactName:n,webhook_name:n,webhook_phone:p,webhook_email:e,webhook_service:s||'Not specified',webhook_message:'Quick form submission',webhook_source:'Trebor Website - Hero Form'};
  console.log('[Trebor Hero Form] Sending payload:',JSON.stringify(payload,null,2));
  fetch('https://paymegpt.com/api/webhooks/flow/wg7doxi3/80397fb1cfdca4405623512c8858469b404af043da20a1b781cf9a424ab82a53',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  .then(res=>{console.log('[Trebor Hero Form] Status:',res.status);return res.text().then(t=>{console.log('[Trebor Hero Form] Response:',t);});})
  .catch(err=>console.error('[Trebor Hero Form] Error:',err))
  .finally(()=>{document.getElementById('heroLeadForm').style.display='none';document.getElementById('heroFormSuccess').style.display='block';setTimeout(resetHeroForm,15000);});
}
function resetHeroForm(){document.getElementById('heroLeadForm').style.display='block';document.getElementById('heroFormSuccess').style.display='none';const b=document.getElementById('heroFormBtn');b.disabled=false;b.innerHTML='Request My Free Consultation <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';['hfName','hfPhone','hfEmail'].forEach(id=>document.getElementById(id).value='');document.getElementById('hfService').value=''}
let resetTimer;
function submitLeadForm(){
  const n=document.getElementById('fname').value.trim(),e=document.getElementById('femail').value.trim(),p=document.getElementById('fphone').value.trim(),s=document.getElementById('fservice').value,m=document.getElementById('fmessage').value.trim();
  if(!n||!e||!p){alert('Please fill in your name, email, and phone number.');return}
  const btn=document.getElementById('formSubmitBtn');btn.disabled=true;btn.textContent='Sending...';
  const payload={contactPhone:p,contactName:n,webhook_name:n,webhook_phone:p,webhook_email:e,webhook_service:s||'Not specified',webhook_message:m||'No message',webhook_source:'Trebor Website'};
  console.log('[Trebor Contact Form] Sending payload:',JSON.stringify(payload,null,2));
  fetch('https://paymegpt.com/api/webhooks/flow/wg7doxi3/80397fb1cfdca4405623512c8858469b404af043da20a1b781cf9a424ab82a53',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  .then(res=>{console.log('[Trebor Contact Form] Status:',res.status);return res.text().then(t=>{console.log('[Trebor Contact Form] Response:',t);});})
  .catch(err=>console.error('[Trebor Contact Form] Error:',err))
  .finally(()=>showSuccess());
}
function showSuccess(){document.getElementById('leadForm').style.display='none';document.getElementById('formSuccess').style.display='block';resetTimer=setTimeout(resetLeadForm,15000)}
function resetLeadForm(){clearTimeout(resetTimer);document.getElementById('leadForm').style.display='block';document.getElementById('formSuccess').style.display='none';const b=document.getElementById('formSubmitBtn');b.disabled=false;b.innerHTML='Request My Free Consultation <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';['fname','femail','fphone','fmessage'].forEach(id=>document.getElementById(id).value='');document.getElementById('fservice').value=''}
function triggerRuthVoice(){
  // Try PMG widget API first
  if(window.PMGWidget && typeof window.PMGWidget.open==='function'){window.PMGWidget.open();return;}
  // Try common PMG selectors
  const sel=['[id*="pmg"][class*="btn"]','[id*="pmg"][class*="button"]','[class*="pmg-chat"]','[class*="pmg-widget"] button','[data-widget="99904174"] button'];
  for(const s of sel){const el=document.querySelector(s);if(el&&el!==document.getElementById('ruth-launcher')){el.click();return;}}
  // Position-based fallback — bottom-right 200x200px zone, skip our own button
  const vw=window.innerWidth,vh=window.innerHeight;
  const candidates=document.elementsFromPoint(vw-80,vh-120);
  for(const el of candidates){
    if(el===document.getElementById('ruth-launcher')||el.closest('#ruth-launcher'))continue;
    if(el.tagName==='BUTTON'||el.getAttribute('role')==='button'||el.onclick){el.click();return;}
  }
}
// Hide PMG's own launcher button after it loads async
const pmgObserver=new MutationObserver(()=>{
  const pmgBtn=document.querySelector('[id*="pmg-widget-launcher"],[class*="pmg-launcher-btn"],[class*="widget-launcher-btn"]');
  if(pmgBtn){pmgBtn.style.cssText='display:none!important;opacity:0!important;pointer-events:none!important';pmgObserver.disconnect();}
});
pmgObserver.observe(document.body,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>{initReveals();document.getElementById('navbar').classList.add('scrolled')});