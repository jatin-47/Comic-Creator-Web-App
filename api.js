window.onload = function() {
	var strip = document.getElementById("strip");
	// adding 10 comic generating items to the strip
	for (var i = 1; i < 11; i++) {
		var item = document.createElement("div");
		item.id = "item_" + i;
		item.innerHTML = `<div class="form-cont d-flex"><textarea name="" cols="30" rows="4" placeholder="Input you text here" required></textarea><button class="generate_but" data-item="item_${i}" onclick="request_api(this)">Generate</button></div><div class="loader-cont hide"><div class="loader-screen"><div class="loader"></div><p class="text-center">Generating...</p></div><p class="error-msg"></p><button class="abort_but">Abort</button></div><div class="img-cont hide"></div>`;
		strip.appendChild(item);
	}
}

// fetching routine
async function query(data, controller) {
	try {
		const response = await fetch(
			"https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
			{
				headers: { 
					"Accept": "image/png",
					"Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM", 
					"Content-Type": "application/json" 
				},
				method: "POST",
				signal: controller.signal,
				body: JSON.stringify(data),
			}
		);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const result = await response.blob();
		return result;
	} catch (error) {
		console.error('Error fetching data:', error.message);
    	throw error;
	}
}

// getting the response from the API and toggling the views of a particular comic panel
function request_api(button){
	// grabbing all the necessary DOM elements.
	var div = button.parentElement.parentElement;
	var formContainer = div.getElementsByClassName("form-cont")[0];
	var text = formContainer.getElementsByTagName("textarea")[0].value;
	var imgContainer = div.getElementsByClassName("img-cont")[0];
	var loaderContainer = div.getElementsByClassName("loader-cont")[0];
	var loader = loaderContainer.getElementsByClassName("loader-screen")[0]
	var errorEl= loaderContainer.getElementsByClassName("error-msg")[0];
	// creating a fetch request controller object to control its manual abortion by the user 
	const controller = new AbortController();
	
	// going to the loading screen
	formContainer.classList.replace('d-flex', 'hide');
	loader.classList.remove("hide");
	errorEl.innerHTML = '';
	loaderContainer.classList.replace('hide', 'd-flex');
	imgContainer.classList.add('hide');

	// abort the request on clicking the abort button and go back to the form screen
	loaderContainer.getElementsByTagName("button")[0].addEventListener("click", function(){
		formContainer.classList.replace('hide', 'd-flex');
		loaderContainer.classList.replace('d-flex', 'hide');
		imgContainer.classList.add('hide');
		controller.abort();
	});

	// send the request to the api
    query({"inputs": text}, controller).then((response) => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(response);
		
		// adding the back button to the image container
		imgContainer.innerHTML = '<button class="back_but"><<</button>';
		// adding the image to the image container
        imgContainer.appendChild(img);

		// going back to the form on clicking the back button
		imgContainer.getElementsByTagName("button")[0].addEventListener("click", function(){
			formContainer.classList.replace('hide', 'd-flex');
			loaderContainer.classList.replace('d-flex', 'hide');
			imgContainer.innerHTML = '';
			imgContainer.classList.add('hide');
		});

		// going to the image screen
		formContainer.classList.replace('d-flex', 'hide');
		loaderContainer.classList.replace('d-flex', 'hide');
		imgContainer.classList.remove('hide');

    }).catch((error) => {
		if (error.name === 'AbortError') {
			// going to the form screen if the request is aborted by the user
			formContainer.classList.replace('hide', 'd-flex');
			loaderContainer.classList.replace('d-flex', 'hide');
			imgContainer.classList.add('hide');
		}
		else {
			// staying on the load screen with error being shown, returned due to request failure
			errorEl.innerHTML = error.message;
			loader.classList.add("hide");
			formContainer.classList.replace('d-flex', 'hide');
			loaderContainer.classList.replace('hide', 'd-flex');
			imgContainer.classList.add('hide');
		}
	});
}

// function to generate the comic strip preview in a canvas
function generate_preview() {
	// create a canvas element
	var canvas = document.createElement('canvas');
	var final = document.getElementById('final')
	final.innerHTML = "";
	// get all the images in the strip
	const imageTags = document.getElementsByTagName('img');

	// making images form the obtained images
	images = [];
	for(var i = 0; i < imageTags.length; i++) {
		var image = document.createElement('img');
		image.src = imageTags[i].src;
		image.width = 350;
		image.height = 350;
		images.push(image);
	}

	// rendering the images in a strip on a canvas
	if(images.length != 0) {
		var wd = 350
		var ht = 350;
		canvas.width = Math.min(wd * images.length, wd * 5); 
		canvas.height = ht + parseInt((images.length-1)/5)*ht ; 
		final.appendChild(canvas);
		const ctx = canvas.getContext('2d');
		for(var i = 0; i < images.length; i++) {
			var x = wd*(i%5); 
			var y = parseInt(i/5)*ht;
			ctx.drawImage(images[i], x, y, wd, ht);
		}
		document.getElementById("download").style.display = "block";
	}
	else{
		// if no images are there keep the download button hidden.
		document.getElementById("download").style.display = "none";
	}
}

// function to download the generated comic strip in canvas as png
function download() {
	var canvas = document.getElementsByTagName('canvas')[0];
	if(canvas){
		const dataURL = canvas.toDataURL('image/png');
	
		// Create a temporary link element
		const link = document.createElement('a');
		link.download = 'comic.png'; 
		link.href = dataURL;
		
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}