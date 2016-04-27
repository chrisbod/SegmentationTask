
Progressable.FileSystem.root().then(
	function () {
		Progressable.FileSystem.createTextFile("res/text.txt","text").then(function (res) {
			console.log("text.txt created")
		})
		Progressable.FileSystem.createJsonFile("res/json.json","{}").then(function (res) {
			console.log("text.txt created")
		})
	}
)