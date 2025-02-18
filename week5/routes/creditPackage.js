const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const { validate: isUuid } = require('uuid');
const logger = require('../utils/logger')('CreditPackage')
const { isUndefined, isNotValidSting, isNotValidInteger } = require('../utils/validators');

/*function isUndefined (value) {
    return value === undefined
  }
  
  function isNotValidSting (value) {
    return typeof value !== "string" || value.trim().length === 0 || value === ""
  }
  
  function isNotValidInteger (value) {
    return typeof value !== "number" || value < 0 || value % 1 !== 0
  }*/

router.get('/', async (req, res, next) => {
    try {
    
        const packages = await dataSource.getRepository('CreditPackage').find({
          select: ['id', 'name',"credit_amount","price"]
        })
        res.status(200).json({
          status: 'success',
          data: packages
        })
      } catch (error) {
        logger.error(error)
        next(error)
      }
})

router.post('/', async (req, res, next) => {
     try {
        const { name , credit_amount,price } = req.body
        if (isUndefined(name) || isNotValidSting(name) ||
        isUndefined(credit_amount) || isNotValidInteger(credit_amount) ||
        isUndefined(price) || isNotValidInteger(price)) {
          res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確'
          })
          return
        }
        const creditPackageRepo = await dataSource.getRepository('CreditPackage')
        const existPackage = await creditPackageRepo.find({
          where: {
            name
          }
        })
        if (existPackage.length > 0) {
          res.status(409).json({
            status: 'failed',
            message: '資料重複'
          })
          return
        }
        const newPackage = await creditPackageRepo.create({
            name: name,
            credit_amount: credit_amount,
            price: price
          })
        const result = await creditPackageRepo.save(newPackage)
        res.status(200).json({
          status: 'success',
          data: result
        })
      } catch (error) {
        logger.error(error)
        next(error)
      }


})

router.delete('/:creditPackageId', async (req, res, next) => {
      try {
        
        const { creditPackageId } = req.params
       // console.log(creditPackageId);
      //  console.log(typeof creditPackageId);
      
        if (!isUuid(creditPackageId)) {
            res.status(400).json({
              status: 'failed',
              message: 'ID格式錯誤，請提供有效的UUID'
            });
            return 
          }
          
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
        if (result.affected === 0) {
          res.status(400).json({
            status: 'failed',
            message: 'ID錯誤'
          })
          return
        }
        res.status(200).json({
          status: 'success',
          data: result
        })
        res.end()
      } catch (error) {
        logger.error(error)
        next(error)
      }
})

module.exports = router
