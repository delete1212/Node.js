const router = require('express').Router()

router.get('/shirts', (요청, 응답) => {
    응답.send('Shirts')
})
router.get('/pants', (요청, 응답) => {
    응답.send('Pants')
})

module.exports = router