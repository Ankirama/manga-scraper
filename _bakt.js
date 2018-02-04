var mangascraper = require('./index.js');

mangascraper.setAPI('mangafox')
    .then(function(result) {
        if (result === false) { console.log('Unable to find this API'); } else {
            mangascraper.getAPI().package.setAPIKey('');
//            mangascraper.getAPI().package.getPages('tensei-shitara-slime-datta-ken', 'ch012')
//            mangascraper.getAPI().package.getImages('tensei_shitara_slime_datta_ken', 'c012') // mangafox
//                        mangascraper.getAPI().package.getMangaList()
//            mangascraper.getAPI().package.getManga('11995')
mangascraper.getAPI().package.getManga('tensei_shitara_slime_datta_ken')
//mangascraper.getAPI().package.getManga('55a6db8e719a162625b32e3a')
//mangascraper.getAPI().package.getManga('tensei-shitara-slime-datta-ken')
//mangascraper.getAPI().package.search('isekadwqkki')
.then(console.log)
                .catch(function(err) {
                    console.log('err => ', err);
                });
        }
    })
    .catch(err => {console.log('err glob =>', err);})