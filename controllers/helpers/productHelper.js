const { response } = require('express')
const product = require('../../model/productSchema')
const category = require('../../model/categorySchema')
const language = require('../../model/languageSchema')
const { count } = require('../../model/userSchema')
const { ObjectId } = require('mongodb')


module.exports={
    addProduct:(data,file,video)=>{
        return new Promise(async(resolve,reject)=>{
        //    console.log(file); 
            let response={}
            let toLearnarr = data.learn
            let requirementsArr=data.requirements
            let coursename=data.name
            let newProduct = await new product({
                courseName:coursename.toUpperCase(),
                category:data.category,
                imageUrl:file,
                language:data.language,
                description:data.description,
                price:data.price,
                hours:data.hours,
                listed:true,
                toLearn:toLearnarr.split('*'),
                videoUrl:video,
                requirements:requirementsArr.split('*')
                
            })
            newProduct.save()
            response.status = true
            resolve(response)
        })
    },
    addCategory:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let newCategory = await new category({
                name:data.name
            })
            newCategory.save()
            response.status= true
            resolve(response)
        })
    },
    addLanguage:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let newLanguage = await new language({
                language:data.name
            })
            newLanguage.save()
            response.status=true
            resolve(response)

        })
    },
    editProduct:(id,data,image,video)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            // toLearnArr=await data.learn.split('*')
            // let requirementsArr = data.requirements.split('*')


            if(image){
                await product.findOneAndUpdate({_id:id},{$set:{imageUrl:image}})
            }
            if(video){
                await product.findOneAndUpdate({_id:id},{$set:{videoUrl:video}})
                console.log('updated');
            }
           let updatedData =await product.findOneAndUpdate({_id:id},{$set:{
            courseName:data.name,
            category:data.category,
            description:data.description,
            hours:data.hours,
            price:data.price,
            language:data.language,
            // toLearn:toLearnArr,
            // requirements:requirementsArr
        }})
           await updatedData.save()
           response.status=true
           resolve(response)
        })

    },
    sortProducts:(sort)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(sort);
            if(sort=='priceHightoLow'){
                let products=await product.find().sort({price:-1})
                resolve(products)

            }
            if(sort=='priceLowtoHigh'){
                let products=await product.find().sort({price:1})
                resolve(products)
            }
            if(sort=='newest'){
                let products=await product.find().sort({date:-1})
                resolve(products)
            }
            
        })
      
    },
    getProductCount:()=>{
     return new Promise(async(resolve,reject)=>{
        let webDevolopment= await product.find({category:ObjectId('63a1bd803319621c17146b08')})
        let dataScience= await product.find({category:ObjectId('63872e5c732e87828fdb37f4')})
        let machineLearning= await product.find({category:ObjectId('63872ef4732e87828fdb37fa')})
        let appDevolopment= await product.find({category:ObjectId('63873c45ab2c97516ec9165a')})
        let basicCoding =   await product.find({category:ObjectId('63872e73732e87828fdb37f7')})
        let Counts={}
        Counts.webDevolopmentLength=webDevolopment.length
        Counts.dataScienceLength=dataScience.length
        Counts.machineLearningLength=machineLearning.length
        Counts.appDevolopmentLength=appDevolopment.length
        Counts.basicCodingLength=basicCoding.length
        
        resolve(Counts)

     })   
    },
    getVideo:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let course=await product.findOne({_id:proId}).then((course)=>{
                if(course.users.includes(ObjectId(userId))){
                    let videoArr=[]
                    for(let i=0;i<course.videoUrl.length;i++){
                       let url= course.videoUrl[i].eager[0].secure_url
                       videoArr.push(url)
                    }
                    // console.log(videoArr)
                    resolve(videoArr)
                    
                }else{
                    reject()
                }
            })
        })
        
    }
}