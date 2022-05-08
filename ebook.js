class Bookstore{
    constructor(id, bookId, bookTitle, bookAbout, bookImage){
      this.id = id;
      this.bookId= bookId; 
      this.bookTitle = bookTitle;
      this.bookAbout = bookAbout;
      this.bookImage = bookImage;
    }

}
class Store {
    constructor(){
        this.books = [];
        this.userId = "";
        this.products =  document.querySelector("#bookArchives");
        this.newTitle = document.querySelector("#bookName");
        this.newImage =  document.querySelector("#bookImage");
        this.newDetails = document.querySelector("#bookDetails");
        this.submitBook = document.querySelector("#newBookProducts");
        this.imagePreview = document.querySelector(".imagePreview");
        this.authUserText =  document.querySelector('.userName');
        this.authUserLogin =  document.querySelector('#loginUser');
        this.userDetails = document.querySelector('#currentUserDetails');

        this.stickyNav = document.querySelector('.searchForBooks');
        this.loggedInHeader = document.querySelector('.loggedInUser');
        this.loggedInMain = document.querySelector('.loggedInMain');
        this.helloName = document.querySelector('.welcomeName');
        this.logout = document.querySelector('.logout');

        this.loggedOutHeader = document.querySelector('.loggedOutUser');
        this.loggedOutMain = document.querySelector('.loggedOutMain');

        this.imageData();
        alertify.set('notifier','position', 'bottom-right');

                  
        // Initialize FIREBASE UI
        this.ui = new firebaseui.auth.AuthUI(firebase.auth());
        this.handleAuth();
        this.bookEventListeners();
        this.displayProduct();

    }

    handleAuth(){
      firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            this.userId = user.uid;
            this.authUserText.innerHTML = `${user.displayName} (Profile)`;
            this.userDetails.innerHTML = `
            Name: ${user.displayName} <br><hr>
            Email: ${user.email}`;            // ...
            alertify.success(`${user.displayName} logged in!`); 
            this.redirectToApp();

          } else {
            // User is signed out
            // ...
            this.redirectToAuth();
          }
        });
  }
  handlesignOut(){
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        this.redirectToAuth();
        this.products.innerHTML = '';
        alertify.success(`User logged out!`); 
      }).catch((error) => {
        // An error happened.
        console.log('Error Ocurred', error);
      });
}

  redirectToApp(){
    this.stickyNav.style.display = 'block';
    this.loggedInHeader.style.display = 'block';
    this.loggedInMain.style.display = 'block'; 

    this.loggedOutHeader.style.display = 'none';
    this.loggedOutMain.style.display = 'none';
    this.fetchBooksFromDB();
  }

  redirectToAuth(){
    this.stickyNav.style.display = 'none';
    this.loggedInHeader.style.display = 'none';
    this.loggedInMain.style.display = 'none'; 

    this.loggedOutHeader.style.display = 'block';
    this.loggedOutMain.style.display = 'flex';
    this.ui.start('#loginUser', {
        callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => {
              // User successfully signed in.
              // Return type determines whether we continue the redirect automatically
              // or whether we leave that to developer to handle.
              this.userId = authResult.user.uid;
              console.log(user);
              this.redirectToApp();
            }
          },
        signInOptions: [
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        // Other config options...
      });
}

fetchBooksFromDB(){
  var docRef = db.collection("users").doc(this.userId);

  docRef.get().then((doc) => {
      if (doc.exists) {
          // console.log("Document data:", doc.data().notes);
          this.books = doc.data().newBook;
          this.displayProduct();
      } else {
          // doc.data() will be undefined in this case
          // console.log("No such document!");
          db.collection("users").doc(this.userId).set({
            newBook: []
          })
          .then(() => {
              // console.log("user successfully written!");
          })
          .catch((error) => {
              console.error("Error writing document: ", error);
          });
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
}

    saveBooks(){
        db.collection("users").doc(this.userId).set({
            newBook: this.books
        })
        .then(() => {
            // console.log("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });

    }

    render(){
        this.saveBooks();
        this.displayProduct();
    }

    bookEventListeners(){
            this.submitBook.addEventListener("submit", (event)=>{
                event.preventDefault();
                const bookTitle = this.newTitle.value;
                const bookAbout = this.newDetails.value;
                const bookImage = this.imageURL;
                this.addProduct({bookTitle, bookAbout, bookImage});
                alertify.success(`${bookTitle} added to book store`); 
                this.newTitle.value = '';
                this.newDetails.value = '';
                this.newImage.value = '';
                this.imagePreview.innerHTML = `
                <img width="50%" id="bookImagePreview" src="assets/image.svg" alt="your image" />
                `;
            });
            document.body.addEventListener("click", (event) => {
              this.handlingDelete(event);
          });
          this.logout.addEventListener('click',(event)=>{
            this.handlesignOut();
          })
    }


    addProduct({bookTitle, bookAbout, bookImage}) {
      const newBook = {id: cuid(), bookId: cuid(), bookTitle, bookAbout, bookImage}
      this.books = [...this.books, newBook];
      console.log(this.books);
      this.render();
}

    imageData(){
                // Convert Image to dataurl
                this.newImage.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    // Encode the file using the FileReader API
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        this.imageURL = reader.result;
                    };
                    reader.readAsDataURL(file);
                });
        
    }

    handlingDelete(event) {
      const selectedProduct = event.target.closest(".books");
      if (selectedProduct && event.target.closest(".delete")) {
          this.selectedId = selectedProduct.id;
          this.deleteBook(this.selectedId);
      } else {
          return;
      }
  }
    

    deleteBook(id) {
      this.books = this.books.filter((newBook) => {
        newBook.id != id
        alertify.success(`${newBook.bookTitle} removed from book store`); 
      });
      this.render();
  }

    displayProduct(){
        this.products.innerHTML = this.books.map(
          (newBook) => `
          <div class="books" id="${newBook.id}">
          <div class="book">
            <div class="bookImage">
              <img src="${newBook.bookImage}" class="card-img-top p-4" alt="...">
            </div>
            <div class="bookBody">
              <h5 class="bookTitle">${newBook.bookTitle}</h5>
              <div class="bookFooter d-flex justify-content-between">
                <a class="btn" data-bs-toggle="modal" data-bs-target="#${newBook.bookId}">
                  <img src="assets/play.svg" alt="" height="30px" srcset="">
                </a>
                <div class="d-flex">
                <a class="btn delete">
                  <img src="assets/delete.svg" alt="">
                  </a>
              </div>
              </div>
            </div>
          </div>
            <!-- Modal -->
            <div class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" id="${newBook.bookId}" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-scrollable">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">${newBook.bookTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                  ${newBook.bookAbout}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
        </div> 
          `
      ).join("");
    }
}

const myStore = new Store();