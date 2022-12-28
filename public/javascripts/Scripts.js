const { get } = require("mongoose")


// const Swal = require('sweetalert2')
function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Added to cart',
                    showConfirmButton: false,
                    timer: 1000
                  })
            }
            
        }
    })
}
function deleteCartItem(proId){
    Swal.fire({
        title: 'Are you sure?',
        text: "remove item from cart!",
        icon: false,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'remove'
      }).then((result) => {
        if (result.isConfirmed) {
          
            $.ajax({
                url:'/delete-cart-item/'+proId,
                method:'get',
                success:(response)=>{
                    if(response.status){
                        window.location.reload()
                    }
                    
                }
            }) 
        
        }
      })
}
$('#checkoutForm').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'placeorder',
        method:'post',
        data:$('#checkoutForm').serialize(),
        success:(response)=>{
            if(response.status){
                razorPayment(response)
            }else if(response.productExist){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'you have already purchased a product' +response.duplicateProName,
                    footer: '<a href="/cart">Go back to cart and remove that product</a>'
                  })
            }else{
                alert('order failed')
            }
        }
    })
})
function razorPayment(order){
    var options = {
        "key": "rzp_test_6WahxXqq72doQQ", // Enter the Key ID generated from the Dashboard
        "amount": order.orderDetails.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Elearn",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.orderDetails.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options)
    rzp1.open();
}
function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            console.log(response.status);
            if(response.status){
                console.log('reloading');
                location.href='/payment-success'
            }else{
                alert('payment failed')
            }
        }
    })
}
function addToWhishlist(proID){
    $.ajax({
        url:'/add-to-wishlist/'+proID,
        method:'get',
        success:(response)=>{
            if(response.status){
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Added to Wishlist',
                    showConfirmButton: false,
                    timer: 1000
                  })
            }
            
        }
    })
    
}
function deleteWishItem(proId){
    Swal.fire({
        title: 'Are you sure?',
        text: "remove item from wishlist!",
        icon: false,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'remove'
      }).then((result) => {
        if (result.isConfirmed) {
          
            $.ajax({
                url:'/delete-wish-item/'+proId,
                method:'get',
                success:(response)=>{
                    if(response.status){
                        window.location.reload()
                    }
                    
                }
            }) 
        
        }
      })
}
function movetoWishfromCart(proId){
    Swal.fire({
        title: 'Are you sure?',
        text: "move item to wishlist!",
        icon: false,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'move'
      }).then((result) => {
        if (result.isConfirmed) {
          
            $.ajax({
                url:'/move-to-wish/'+proId,
                method:'get',
                success:(response)=>{
                    if(response.status){
                        window.location.reload()
                    }
                    
                }
            }) 
        
        }
      })

}
function movetoCartfromWish(proId){
    $.ajax({
        url:'/move-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Added to cart',
                    showConfirmButton: false,
                    timer: 1000
                  }).then(()=>{
                    location.reload()
                  })
            }
            
        }
    })
}
$(document).ready(function(){
    $("#myInput").on("keyup", function() {
      var value = $(this).val().toUpperCase();
      console.log(value);
      $("#filterDiv").filter(function() {
        $(this).toggle($(this).text().toUpperCase().indexOf(value) > -1)
      });
    });
  });

 function viewForm(){
    let mainDiv=document.getElementById('formDiv')
    mainDiv.style.display='block'
    let button=document.getElementById('resetButton')
    button.style.display='none'
    let cancelButton=document.getElementById('cancelButton')
    cancelButton.style.display='block'

 }
 function cancelForm(){
    let mainDiv=document.getElementById('formDiv')
    mainDiv.style.display='none'
    let button=document.getElementById('resetButton')
    button.style.display='block'
    let cancelButton=document.getElementById('cancelButton')
    cancelButton.style.display='none'
 }
function changeProfile(){
    let button=document.getElementById('changeButton')
    let form=document.getElementById('picForm')
    button.style.display='none'
    form.style.display='block'
}


