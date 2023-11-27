window.onload = function() {
	var strip = document.getElementById("strip");
	for (var i = 1; i < 11; i++) {
		var item = document.createElement("div");
		item.id = "item_" + i;
		item.innerHTML = `<div class="form-cont d-flex"><textarea name="" cols="30" rows="4" placeholder="Input you text here" required></textarea><button class="generate_but" data-item="item_${i}" onclick="request_api(this)">Generate</button></div><div class="loader-cont hide"><div class="loader-screen"><div class="loader"></div><p class="text-center">Generating...</p></div><p class="error-msg"></p><button class="abort_but">Abort</button></div><div class="img-cont hide"></div>`;
		strip.appendChild(item);
	}
}

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

function download() {
	var canvas = document.getElementsByTagName('canvas')[0];
	if(canvas){
		const dataURL = canvas.toDataURL('image/png');
	
		// Create a temporary link element
		const link = document.createElement('a');
		link.download = 'comic.png'; // Set the download attribute
		link.href = dataURL;
		
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}


function request_api(button){
	var item_id = button.getAttribute("data-item");
	// get the div with this item_id
	var div = button.parentElement.parentElement;
	var formContainer = div.getElementsByClassName("form-cont")[0];
	var text = formContainer.getElementsByTagName("textarea")[0].value;
	var imgContainer = div.getElementsByClassName("img-cont")[0];
	var loaderContainer = div.getElementsByClassName("loader-cont")[0];
	var loader = loaderContainer.getElementsByClassName("loader-screen")[0]
	var errorEl= loaderContainer.getElementsByClassName("error-msg")[0];
	// get the textarea child of this div
	const controller = new AbortController();
	
	formContainer.classList.replace('d-flex', 'hide');
	loader.classList.remove("hide");
	errorEl.innerHTML = '';
	loaderContainer.classList.replace('hide', 'd-flex');
	imgContainer.classList.add('hide');

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
		imgContainer.innerHTML = '<button class="back_but"><<</button>';
        imgContainer.appendChild(img);
		imgContainer.getElementsByTagName("button")[0].addEventListener("click", function(){
			formContainer.classList.replace('hide', 'd-flex');
			loaderContainer.classList.replace('d-flex', 'hide');
			imgContainer.innerHTML = '';
			imgContainer.classList.add('hide');
		});

		formContainer.classList.replace('d-flex', 'hide');
		loaderContainer.classList.replace('d-flex', 'hide');
		imgContainer.classList.remove('hide');
    }).catch((error) => {
		if (error.name === 'AbortError') {
			formContainer.classList.replace('hide', 'd-flex');
			loaderContainer.classList.replace('d-flex', 'hide');
			imgContainer.classList.add('hide');
		}
		else {
			console.error('Fetch data error:', error);
			errorEl.innerHTML = error.message;
			loader.classList.add("hide");
			formContainer.classList.replace('d-flex', 'hide');
			loaderContainer.classList.replace('hide', 'd-flex');
			imgContainer.classList.add('hide');
		}
	});
}


function generate_preview() {
	// create a canvas element
	var canvas = document.createElement('canvas');
	var final = document.getElementById('final')
	final.innerHTML = "";
	const imageTags = document.getElementsByTagName('img');
	images = [];
	for(var i = 0; i < imageTags.length; i++) {
		var image = document.createElement('img');
		image.src = imageTags[i].src;
		image.width = 350;
		image.height = 350;
		images.push(image);
	}
	if(images.length != 0) {
		var wd = 350
		var ht = 350;
		canvas.width = Math.min(wd * images.length, wd * 5); // Change the width of the canvas
		canvas.height = ht + parseInt((images.length-1)/5)*ht ; // Change the height of the canvas
		final.appendChild(canvas);
		const ctx = canvas.getContext('2d');
		for(var i = 0; i < images.length; i++) {
			var x = wd*(i%5); // Change the positioning of images
			var y = parseInt(i/5)*ht;
			ctx.drawImage(images[i], x, y, wd, ht);
		}
	}
}