const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const { validate: isUuid } = require('uuid');
const logger = require('../utils/logger')('Coaches')
const { isUndefined, isNotValidSting, isNotValidInteger } = require('../utils/validators');

/*function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}*/

router.get('/', async (req, res, next) => {
  try {
    //做成迴圈？
    let{ per, page } = req.query;
    
    if(isNotValidSting(per) || isNotValidSting(page)) {
      res.status(400).json({
      status: 'failed',
      message: '欄位未填寫正確'
    })
    return
    }
    per =  parseInt(per);
    page = parseInt(page);
    
    const take = per;
    const skip = (page-1)*per;

    const coaches = await dataSource.getRepository("Coach").find({
        select: {
          id: true,
          user_id: { name: true },
          created_at:true
        },
        order: {created_at: "ASC" },
        take,
        skip,
        relations: ['User']
      });
      
      const result = coaches.map(coach => ({
        id: coach.id,
        name: coach.User.name   
      }));
      
    res.status(200).json({
      status: 'success',
      data: result
    })


  } catch (error) {
    logger.error(error)
    next(error)
  }
})

router.get('/:coachId', async (req, res, next) => {
    try {
        const {coachId} = req.params
        if (!isUuid(coachId)) {
            res.status(400).json({
              status: 'failed',
              message: 'ID格式錯誤，請提供有效的UUID'
            });
            return 
          }
        const coach = await dataSource.getRepository('Coach').findOne({
        where: { id: coachId }
        })
        if (!coach) {
            logger.warn('此教練ID不存在')
            res.status(400).json({
              status: 'failed',
              message: '找不到該教練'
             })
            return
        }
        const user = await dataSource.getRepository('User').findOne({
                        select: ["name", "role"],
                        where: { id: coach.user_id }
                        })
          
        res.status(200).json({
          status: 'success',
          data: {
            user,
            coach}
        })
    } catch (error) {
      logger.error(error)
      next(error)
    }
})



module.exports = router