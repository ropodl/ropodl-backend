export const getFileUrl = () => {
    if(process.env.APP_ENV === "dev") {
        return `${process.env.APP_URL}:${process.env.APP_PORT}/media/`
    }
    return `${process.env.APP_URL}/media/`
}