const { Router } = require('express');
const router = Router();
const axios = require('axios');

const author = {
    name : "Cesar",
    lastname: "Artunduaga"
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}
router.get('/items', async (req, res) => {
    const dataRes = await axios.get(`https://api.mercadolibre.com/sites/MLA/search?q=${req.query.q}`)
    .then(function (response) {
        const results = response.data.results;
        const resp = {
            'author': author,
            'categories': [],
            'items': [],
        };
        
        if(results.length){
            const allCategory = [];
            for (let i = 0; i < 4; i++) {
                const element = results[i];
                if(element){
                    const item = {
                        'id': element.id,
                        'title': element.title,
                        'price': {
                            'currency': element.currency_id,
                            'amount': element.price,
                            'decimals': 2
                        },
                        'picture': element.thumbnail,
                        'condition': element.condition,
                        'free_shipping': element.shipping.free_shipping,
                    };
                    resp.items.push(item);
                    if(!allCategory.find(elem => elem.category_id == element.category_id)) allCategory.push({category_id : element.category_id});
                }
            }

            allCategory.forEach((element) => {
                const countOccurrences = (arr, val) => arr.reduce((a, v) => (v.category_id === val ? a + 1 : a), 0);
                element.count = countOccurrences(results, element.category_id);
            });

            
            const bestSellingCategory = response.data.available_filters.find( category => category.id === 'category' );
        
            if(bestSellingCategory){
                resp.categories.push(bestSellingCategory.values[0].name);
            }
            else{
                const filter = response.data.filters.find( category => category.id === 'category' );
                const sub = filter.values[0].path_from_root.find( value => value.id === allCategory[0].category_id );
                resp.categories.push(filter.values[0].name);
                resp.categories.push(sub.name);
            }
        }
        res.json(resp);
    })
    .catch(function (error) {
        console.log(error);
    });

});


router.get('/items/:id',async (req, res) => {
    const dataRes = await axios.get(`https://api.mercadolibre.com/items/${req.params.id}`)
    .then(async function  (response) {
        const resp = {
            'author': author,
            'item': {
                'id': response.data.id,
                'title': response.data.title,
                'price': {
                    'currency': response.data.currency_id,
                    'amount': response.data.price,
                    'decimals': 2,
                },
                'picture': response.data.pictures[0].url,
                'condition': response.data.condition,
                'free_shipping': response.data.shipping.free_shipping,
                'sold_quantity': response.data.sold_quantity,
                'description': ''
            }
        }

        await axios.get(`https://api.mercadolibre.com/items/${req.params.id}/description`)
        .then(function (response) {
            resp.item.description = response.data.plain_text;
            res.json(resp);
        })
        .catch(function (error) {
            console.log(error);
        });
    })
    .catch(function (error) {
        console.log(error);
    });

});


module.exports = router;