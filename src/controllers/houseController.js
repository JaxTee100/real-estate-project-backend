import fs from "fs";
import { prisma } from "../server.js";
import cloudinary from "../config/cloudinary.js";

export const createHouse = async (req, res) => {
    try {
        const { address, price, rooms, floors, bathrooms, estatetype, bathroomType, about, area, features } = req.body;
        const files = req.files || [];
        const userId = req.user?.id; // Assuming user is authenticated
        console.log("User ID in creating house:", userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Missing user ID",
            });
        }

        const uploadResults = await Promise.all(

            files.map((file) =>
                cloudinary.uploader.upload(file.path, {
                    folder: "houses",
                })
            )
        );

        const imageData = uploadResults.map((result) => ({
            url: result.secure_url,
            publicId: result.public_id,
        }));

        let parsedFeatures = [];
        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch {
                parsedFeatures = [features];
            }
        } else if (Array.isArray(features)) {
            parsedFeatures = features;
        }



        const newHouse = await prisma.house.create({
            data: {
                address,
                price: parseFloat(price),
                rooms: parseInt(rooms),
                floors: parseInt(floors),
                bathrooms: parseInt(bathrooms),
                bathroomType,
                estatetype,
                area: parseFloat(area),
                about,
                features: parsedFeatures,

                user: {
                    connect: { id: userId }
                },
                images: {
                    create: imageData,
                },
            },
            include: {
                images: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
        });

        // Cleanup temp files
        files.forEach((file) => {
            if (file?.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        res.status(201).json({
            success: true,
            message: "House created successfully",
            house: newHouse,
            
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: `Error creating house: ${e.message}`,
            house: null
        });
    }
};

export const getAllHouses = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("User ID in fetching all houses:", userId);
        const houses = await prisma.house.findMany({
            where: { userId }, // Only get houses for this user
            include: {
                images: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({
            success: true,
            message: 'Fetched houses successfully',
            houses,
            number: houses.length
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Error fetching houses" });
    }
};

export const getHouseByID = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        console.log("User ID in fetching house by ID:", userId);

        const house = await prisma.house.findUnique({
            where: { id },
            include: {
                images: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
        });

        if (!house) {
            return res.status(404).json({ success: false, message: "House not found", house: null });
        }

        // Check ownership
        if (house.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this house",
                house: null
            });
        }

        res.status(200).json({ success: true, message: "House found", house });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Error fetching house", house: null });
    }
};

export const updateHouse = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { address, price, rooms, floors, bathrooms, estatetype, bathroomType, area, about, features } = req.body;
        const files = req.files || [];

        // First check if house exists and belongs to user
        const existingHouse = await prisma.house.findUnique({
            where: { id },
            include: { images: true },
        });

        if (!existingHouse) {
            return res.status(404).json({
                success: false,
                message: "House not found",
                house: null
            });
        }

        if (existingHouse.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this house",
                house: null
            });
        }

        // Image handling
        let newImages = [];
        if (files.length > 0) {
            // Delete old images
            const deletePromises = existingHouse.images.map((img) =>
                cloudinary.uploader.destroy(img.publicId)
            );
            await Promise.all(deletePromises);
            await prisma.houseImage.deleteMany({ where: { houseId: id } });

            // Upload new images
            const uploadResults = await Promise.all(
                files.map((file) =>
                    cloudinary.uploader.upload(file.path, { folder: "houses" })
                )
            );
            newImages = uploadResults.map((result) => ({
                url: result.secure_url,
                publicId: result.public_id,
            }));
        }

        // Features handling
        let parsedFeatures = existingHouse.features || [];
        if (features) {
            if (typeof features === 'string') {
                try {
                    parsedFeatures = JSON.parse(features);
                } catch {
                    parsedFeatures = [features];
                }
            } else if (Array.isArray(features)) {
                parsedFeatures = features;
            }
        }

        const updateData = {
            address: address || existingHouse.address,
            price: !isNaN(parseFloat(price)) ? parseFloat(price) : existingHouse.price,
            rooms: !isNaN(parseInt(rooms)) ? parseInt(rooms) : existingHouse.rooms,
            floors: !isNaN(parseInt(floors)) ? parseInt(floors) : existingHouse.floors,
            bathrooms: !isNaN(parseInt(bathrooms)) ? parseInt(bathrooms) : existingHouse.bathrooms,
            estatetype: estatetype || existingHouse.estatetype,
            bathroomType: bathroomType || existingHouse.bathroomType,
            area: !isNaN(parseFloat(area)) ? parseFloat(area) : existingHouse.area,
            about: about || existingHouse.about,
            features: parsedFeatures
        };

        const updatedHouse = await prisma.house.update({
            where: { id },
            data: {
                ...updateData,
                ...(files.length > 0 && {
                    images: {
                        create: newImages
                    }
                })
            },
            include: {
                images: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Cleanup temp files
        files.forEach((file) => {
            if (file?.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        res.status(200).json({
            success: true,
            message: "House updated successfully",
            house: updatedHouse
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Error updating house",
            house: null
        });
    }
};

export const deleteHouse = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existingHouse = await prisma.house.findUnique({
            where: { id },
            include: { images: true },
        });

        if (!existingHouse) {
            return res.status(404).json({
                success: false,
                message: "House not found",
            });
        }

        // Check ownership
        if (existingHouse.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this house",
            });
        }

        // Delete images from Cloudinary
        if (existingHouse.images && existingHouse.images.length > 0) {
            const deleteImagePromises = existingHouse.images.map((img) =>
                cloudinary.uploader.destroy(img.publicId)
            );
            await Promise.all(deleteImagePromises);
            await prisma.houseImage.deleteMany({ where: { houseId: id } });
        }

        await prisma.house.delete({ where: { id } });

        res.status(200).json({
            success: true,
            message: "House deleted successfully",
            deletedId: id
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the house",
        });
    }
};

export const clientHouses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            minPrice,
            maxPrice,
            rooms,
            bathrooms,
            floors,
            bathroomType,
            estatetype,
        } = req.query;

        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;

        const filters = {};

        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.gte = parseFloat(minPrice);
            if (maxPrice) filters.price.lte = parseFloat(maxPrice);
        }

        if (rooms) filters.rooms = parseInt(rooms);
        if (bathrooms) filters.bathrooms = parseInt(bathrooms);
        if (floors) filters.floors = parseInt(floors);
        if (estatetype) filters.estatetype = estatetype;
        if (bathroomType) filters.bathroomType = bathroomType;

        const [houses, total] = await Promise.all([
            prisma.house.findMany({
                where: filters,
                skip,
                take,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    images: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
            }),
            prisma.house.count({
                where: filters,
            }),
        ]);

        res.status(200).json({
            success: true,
            message: "Houses fetched successfully",
            houses,
            currentPage: parseInt(page),
            totalHouses: total,
            totalPages: Math.ceil(total / take),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};