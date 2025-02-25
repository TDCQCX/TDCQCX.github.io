document.addEventListener('DOMContentLoaded', function() {
	const wechatItem = document.querySelector('.wechat-item');
	let activeTimer = null;

	// 桌面端悬浮逻辑
	wechatItem.addEventListener('mouseenter', function() {
		if (window.innerWidth >= 768) {
			clearTimeout(activeTimer);
			this.classList.add('active');
		}
	});

	wechatItem.addEventListener('mouseleave', function() {
		if (window.innerWidth >= 768) {
			activeTimer = setTimeout(() => {
				this.classList.remove('active');
			}, 300);
		}
	});

	// 移动端点击逻辑
	wechatItem.addEventListener('click', function(e) {
		if (window.innerWidth < 768) {
			e.preventDefault();
			this.classList.toggle('active');
		}
	});

	// 点击外部关闭
	document.addEventListener('click', function(e) {
		if (!wechatItem.contains(e.target)) {
			wechatItem.classList.remove('active');
		}
	});
});