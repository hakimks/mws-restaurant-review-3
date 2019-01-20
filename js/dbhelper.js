// import idb from 'idb';


/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }


  static openDatabase() {
    let dbPromise = idb.open('restDatabase', 1, upgradeDb => {
      const store = upgradeDb.createObjectStore('restStore', {keyPath: 'id'});
      const reviews = upgradeDb.createObjectStore('reviewsStore', {keyPath: 'id'});
      const offlineReviews = upgradeDb.createObjectStore('offlineReviewsStore', {keyPath: 'updatedAt'});

      store.createIndex('by-id', 'id');
      reviews.createIndex('Restaurant-id', 'id');

    });

    return dbPromise;
  }

  
  
  static getRestuarantFromServer() {
    return fetch(DBHelper.DATABASE_URL)
            .then(response => {
              return response.json();
            }).then(restaurants => {
              DBHelper.saveToIndxDatabase(restaurants);
              return restaurants;
            });
  }

  static saveToIndxDatabase(restaurantData) {
    return DBHelper.openDatabase().then(database => {
      if(!database) {
        return;
      }
      const tx = database.transaction('restStore', 'readwrite');
      const store = tx.objectStore('restStore');
      restaurantData.forEach(restaurant => {
        store.put(restaurant);
      });
      return tx.complete;
    });
  }

  static fetchStoredRestuarants() {
    return DBHelper.openDatabase().then(database => {
      if(!database) {
        return;
      }
      let store = database
            .transaction('restStore')
            .objectStore('restStore');

      return store.getAll();
    });
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
   
    return DBHelper.fetchStoredRestuarants().then(restaurants => {
      if(!restaurants.length) {
        return DBHelper.getRestuarantFromServer();
      }
      return Promise.resolve(restaurants);
    }).then(restaurants => {
      callback(null, restaurants);
    }).catch(err => {
      callback(err, null);
    });
    
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/webp/${restaurant.photograph}.webp`);
  }

  /**
   * added by Hakim
   * create alt field for resturant
   */
  static ImageAltForResturant(restaurant) {
    return(`${restaurant.name}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  /**
	 * Fetch all reviews for a restaurant
	 */
	static fetchRestaurantReviews(restaurant, callback) {
    console.log(restaurant.id);
		DBHelper.openDatabase().then(db => {
			if (!db) return;

			const tx = db.transaction('reviewsStore');
			const store = tx.objectStore('reviewsStore');
			store.getAll().then(results => {

				if (results && results.length > 0) {
					callback(null, results);
				} else {
          
          fetch('http://localhost:1337/reviews')
					.then(response => {
						return response.json();
					})
					.then(reviews => {
						this.openDatabase().then(db => {
							if (!db) return;
							const tx = db.transaction('reviewsStore', 'readwrite');
							const store = tx.objectStore('reviewsStore');

							reviews.forEach(review => {
								store.put(review);
							})
						});
						callback(null, reviews);
					})
					.catch(error => {
						callback(error, null);
					})
				}
			})
		});
	}

  
	/**
	 * Submit Review
	 */
	static submitReview(data) {
		console.log(data);

		return fetch(`${DBHelper.DATABASE_URL}/reviews`, {
			body: JSON.stringify(data),
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'content-type': 'application/json'
			},
			method: 'POST',
			mode: 'cors',
			redirect: 'follow',
			referrer: 'no-referrer',
		})
		.then(response => {
			response.json()
				.then(data => {
					this.openDatabase().then(db => {
						if (!db) return;
						const tx = db.transaction('reviewsStore', 'readwrite');
						const store = tx.objectStore('reviewsStore');
						store.put(data);
					});
					return data;
				})
		})
		.catch(error => {
			data['updatedAt'] = new Date().getTime();
			console.log(data);

			this.openDatabase().then(db => {
				if (!db) return;
				const tx = db.transaction('offlineReviewsStore', 'readwrite');
				const store = tx.objectStore('offlineReviewsStore');
				store.put(data);
				console.log('Review stored offline in indexed Database');
			});
			return;
		});
	}

	static submitOfflineReviews() {
		DBHelper.openDatabase().then(db => {
			if (!db) return;
			const tx = db.transaction('offlineReviewsStore');
			const store = tx.objectStore('offlineReviewsStore');
			store.getAll().then(offlineReviews => {
				console.log(offlineReviews);
				offlineReviews.forEach(review => {
					DBHelper.submitReview(review);
				})
				DBHelper.clearOfflineReviews();
			})
		})
	}

	static clearOfflineReviews() {
		DBHelper.openDatabase().then(db => {
			const tx = db.transaction('offlineReviewsStore', 'readwrite');
			const store = tx.objectStore('offlineReviewsStore').clear();
		})
		return;
	}

}

