const client = require("@mailchimp/mailchimp_marketing");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.urlencoded({extended:true}));
const https = require("https");
const md5 = require('md5');


//Mailchimp API key aşağıda (kopyası yok)
const myKey = "9074ee60bf5884f365d1d62c648412c1-us21";
const unıqeList = "ca9cf5417e";

//app.use(express.static(path.join(__dirname ,"/public")));
//app.use(express.static("public"));
app.use("/public", express.static("public"));  //223 no'lu ders @Bhuvan <3
//Heroku için dinamik port veya localhost:3000
app.listen(process.env.PORT || 3000 ,function(){
    console.log("Server has started on port 3000.");
});

app.get("/",function(req,res){
    res.sendFile(__dirname + "/signup.html");
});

// "/" html dosyamda istekler yanıtlar ana sayfaya gönderilmişti burada da post ile 
// ana sayfaya gönderilen istekleri dinliyorum ve call back fonksiyonumu çağırıyorum.(form)
app.post("/",function(req, res){
    var firstName = req.body.fName;
    var lastName = req.body.sName;
    var mail = req.body.eMail;
    var data = {
        //membersin içindeki her obje bir kayıt demek ama biz tek seferde bir kişi kaydetmek istiyoruz o yüzden bir obje var.
        //ayrıca merge_fields demek değişken adlar gibi bir şeyi temsil ediyor yani Merhaba [isim] gibi.
        members: [
            {email_address: mail,
                status:"subscribed",
             merge_fields:{
                FNAME : firstName,
                LNAME : lastName,}}
            ]};
    const jsonData = JSON.stringify(data);
    console.log(jsonData);

   /* const url = "https://us21.api.mailchimp.com/3.0/list/ca9cf5417e";
    console.log(url);
    const options = {
        methot: "POST",
        auth:"i:9074ee60bf5884f365d1d62c648412c1-us21",
    };
    console.log(options.auth); */

//dökümantasyondan alındı:
    client.setConfig({
        apiKey: myKey,
        server: "us21",
      });
      
      const run = async () => {
        const response = await client.lists.batchListMembers(unıqeList, {
            members: [
                {email_address: mail,
                    status:"subscribed",
                 merge_fields:{
                    FNAME : firstName,
                    LNAME : lastName,}}
                ]  ,
        });
        console.log(response);
        if (response.error_count === 0 && response.total_created === 1){
            res.sendFile(__dirname + "/güncellendi.html");
        }
        else if(response.errors[0].error_code === "ERROR_CONTACT_EXISTS"){
            res.sendFile(__dirname + "/failure.html");
        }
        else{
            res.sendFile(__dirname + "/errorpage.html");
        }

      };
    run();

 /*   const gönderiistek = https.request(url , options , function(response){
        //.on bir dinleyicidir, onun üzerindedir. burada data'nın üzerinde yani bir 
        //bilgi alışverişi olduğunda çalışacak yer.(burada POSTaladık o yuzden giden bilgiyi söylüyor)
        response.on("data", function(veri) {
            console.log(JSON.parse(veri));
        }) });
    gönderiistek.write(jsonData) //istemciden sunucuya gidecek bilgileri böyle yazıyorum. Yukarıda bir istek oluşturdum şimdi oraya kullanıcı verilerini göndereceğim.    
    gönderiistek.end(); */
      
//https.get(url,call-back function) bu bir siteden veri almamızı sağlar (get) hava durumunda bunu kullandık ama 
//şimdi https.request(url,callback funct) kullanacağız 


});

app.post("/update", function(req,res){
    var firstName = req.body.fName;
    var lastName = req.body.sName;
    var mail = req.body.eMail;
    var newmail = req.body.neweMail;
    const subscriberHash = md5(mail.toLowerCase());

    client.setConfig({
        apiKey: myKey,
        server: "us21",
      });
      
      const run = async () => {
        const response = await client.lists.updateListMember(
          unıqeList,
          subscriberHash,
          {
            email_address: newmail,
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName
              }
          }
        );
        console.log(response);
        if (response.error_count === 0 && response.total_created === 1){
            res.sendFile(__dirname + "/güncellendi.html");
        }
        else if(response.errors[0].error_code === "ERROR_CONTACT_EXISTS"){
            res.sendFile(__dirname + "/failure.html");
        }
        else{
            res.sendFile(__dirname + "/errorpage.html");
        }

      };
      
      run();
      
      
    });

/*
git init 
git --global user.name "name"
git --global user.email "email"
git add .
gitt commit
*/