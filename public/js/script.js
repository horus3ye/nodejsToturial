function controlquantity(quantkey) {
    $.ajax({
        url: '/editQuan',
        type: 'POST',
        data: {
            "id" : id,
            "quantity" : quantity,
            "cart" : cart,
            "key" : quantkey
        },        
        success: function (res) {
            console.log(res);            
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
         },
    }); 
}


$(document).ready(function(){
    $(document).off('click', "#quanplus").on('click',"#quanplus",function(){        
        $('#quantity').value() + 1;
        //controlquantity(quanplus);
    });
});

$(document).ready(function(){
    $(document).off('click', "#quanminus").on('click',"#quanminus",function(){        
        if($('#quantity').value < 1) {
            $('#quantity').value() - 1;
        }
        //controlquantity(quanminus);
    });
});