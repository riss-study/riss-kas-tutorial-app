const time={
    async sleep (ms) {
        return new Promise ((resolve) => {
            setTimeout(()=>{resolve(true)}, ms);
        });
    }
}

module.exports=time;