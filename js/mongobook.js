$('pre').has('code').each(function () {
	var $this = $(this);
	$this.html($('code', $this).html());
});