module.exports.image = function (image, width, height) {
    if (image != undefined) {
        var src = '';
        return '<img src="/image/' + image.id + '/' + width + '/' + height + '/test.jpg' + '">';
    }
    return '';
};