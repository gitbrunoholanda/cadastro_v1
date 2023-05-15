const express =require ("express");
const{v4:uuidv4}=require ("uuid")





const app =express();

app.use(express.json());

const cust =[];


//middleware

function verificationAcountCpf(request,response,next){
    const { cpf}=request.headers;
    const customer=cust.find ((customer)=> customer.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Customer Found"})
    }

    request.customer=customer;
    return next();
}
 function getBalance(statement){
     const balance = statement.reduce((acc, operation) => {
     if(operation.type === 'credit'){
        return acc + operation.amount;
     }else{
        return acc - operation.amount;
      }
     }, 0);
     return balance;
    }
app.post("/accountconta",(request,response) => {
const { cpf,name}=request.body;
const customerAlreadyExists=cust.some(
(customer)=> customer.cpf === cpf
);

if (customerAlreadyExists){
    return response.status(400).json({ error: "Customer alreaady Exits!!"});
}

cust.push({
    cpf,
    name,
    id:uuidv4(),
    statement:[],
 });

    return response.status(201).send(); 
});

//app.use(verificationAcountCpf);

app.get("/Statement", verificationAcountCpf,(request,response) => {
    
    const{customer}=request;

 
    return response.json(customer.statement);
     });


 app.post("/deposit", verificationAcountCpf,(request,response) => {
        const { description, amount }=request.body;
        const {customer}=request;
        
        const statementOperation={
            description,
            amount,
            created_at: new Date(),
            type: "credit",

        };
        customer.statement.push(statementOperation);
        return response.status(201).send();
    });



    app.post("/withdraw", verificationAcountCpf,(request,response) => {
        const { description,amount }=request.body;
        const {customer}=request;
        
      const balance = getBalance(customer.statement);
      if(balance <amount){
        return response.status(400).json({error: "insuficient sald" });
      }

      const statementOperation={
        description,
        amount,
        created_at: new Date(),
        type: "DEBIT",
      };
      customer.statement.push(statementOperation);
      return response.status(201).send();
       
    });


    app.get("/statement/date",verificationAcountCpf,(request,response)=>{
    const {customer}= request;
    const  {date}=request.query;

    const dateFormat= new Date(date + " 00:00");

    const statement=customer.statement.filter(
        (statement)=>
         statement.created_at.toDateString() ===
        new Date(dateFormat).toDateString()
    );

    return response.json(statement);

    });
    app.put("/account",verificationAcountCpf ,(request,response) => {
        const {name}= request.body;
        const {customer}= request;

        customer.name=name;

        return  response.status(201).send();
    });

    app.get("/account",verificationAcountCpf, (request,response)=>{
        const {customer}=request;
        return response.json(customer);
    });


     app.delete("/account",verificationAcountCpf,(request,response)=>{
        const {customer}=request;

        cust.splice(customer,1);
        return response.status(200).json(cust);
    
     });



     app.get("/balance",verificationAcountCpf,(request,response)=>{
        const {customer}=request;

        const balance=getBalance(customer.statement);

        return response.status(200).json(balance);
    
     });

app.listen(3333);
